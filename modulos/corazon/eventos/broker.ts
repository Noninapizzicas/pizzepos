// modulos/corazon/eventos/broker.ts

/**
 * Broker de eventos para el sistema PizzePOS.
 * - Valida la estructura del evento entrante con Zod.
 * - Verifica la llave del dispositivo emisor.
 * - Emite eventos internos según resultado.
 * - Redistribuye el evento a través del distribuidor.
 */

import { validarLlaveDispositivo } from '../validacion/llaves';
import { distribuirEvento } from './distribuidor';
import { EventBus } from '../../core/eventos';
import { z } from 'zod';

// Esquema Zod para validación estructural del evento recibido
const EventoSchema = z.object({
  meta: z.object({
    id: z.string().uuid(),
    timestamp: z.string().datetime(),
    tipo: z.string(),
    origen: z.string(),
    prioridad: z.number().int().positive()
  }),
  payload: z.record(z.any()),
  contexto: z.object({
    dispositivoId: z.string()
  })
});

type TipoEvento = z.infer<typeof EventoSchema>;

/**
 * Procesa un evento crudo:
 * 1. Valida estructura.
 * 2. Valida dispositivo.
 * 3. Emite evento recibido y lo distribuye.
 * 4. Notifica errores si falla algo.
 */
export const procesarEvento = (eventoCrudo: unknown): void => {
  try {
    const evento = EventoSchema.parse(eventoCrudo) as TipoEvento;

    const esValido = validarLlaveDispositivo(
      evento.contexto.dispositivoId,
      evento.meta.origen
    );

    if (!esValido) {
      EventBus.emit('core:llaveRevocada', {
        dispositivo: evento.contexto.dispositivoId,
        motivo: 'Llave no válida o dispositivo inactivo'
      });
      return;
    }

    EventBus.emit('core:eventoRecibido', evento);
    distribuirEvento(evento);

  } catch (error) {
    EventBus.emit('core:errorDetectado', {
      tipoError: 'EVENTO_INVALIDO',
      mensaje: error instanceof Error ? error.message : 'Error desconocido',
      eventoOriginal: eventoCrudo
    });
  }
};

/**
 * Ayuda a construir un evento válido.
 * Se puede usar desde otros módulos para emitir eventos bien formados.
 */
export const crearEvento = <T>(params: TipoEvento): TipoEvento & { payload: T } => {
  return {
    meta: {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      tipo: params.meta.tipo,
      origen: params.meta.origen,
      prioridad: params.meta.prioridad || 1
    },
    payload: params.payload,
    contexto: {
      dispositivoId: params.contexto.dispositivoId
    }
  };
};
