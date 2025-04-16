/**
 * distribuidor.ts
 * 
 * Recibe eventos ya validados desde broker.ts y los redistribuye a través del sistema.
 * No modifica eventos, no guarda estado, no decide destino.
 * Cumple una función de "megáfono" del sistema.
 */

import { EventBus } from '../utils/helpers';
import { Evento } from './broker';

/**
 * Distribuye un evento previamente validado a través del sistema
 * @param evento Evento validado a distribuir
 */
export function distribuirEvento(evento: Evento): void {
  try {
    // Distribuye el evento original usando su tipo como canal
    // Esto permite que cualquier módulo que escuche este tipo reciba el evento
    EventBus.emit(evento.meta.tipo, evento);
    
    // Emite un evento interno para notificar que un evento ha sido distribuido
    const eventoDistribuido = {
      meta: {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        tipo: 'core:eventoDistribuido',
        origen: 'corazon',
        prioridad: evento.meta.prioridad
      },
      payload: {
        eventoOriginalId: evento.meta.id,
        eventoOriginalTipo: evento.meta.tipo,
        eventoOriginalOrigen: evento.meta.origen,
        timestampDistribucion: new Date().toISOString()
      },
      contexto: {
        dispositivoId: 'corazon'
      }
    };
    
    EventBus.emit('core:eventoDistribuido', eventoDistribuido);
    
  } catch (error) {
    // Si ocurre algún error durante la distribución, emite un evento de error
    const errorEvento = {
      meta: {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        tipo: 'core:errorDetectado',
        origen: 'corazon',
        prioridad: 9
      },
      payload: {
        mensaje: 'Error al distribuir evento',
        error: String(error),
        eventoOriginalId: evento.meta.id,
        eventoOriginalTipo: evento.meta.tipo,
        componente: 'distribuidor'
      },
      contexto: {
        dispositivoId: 'corazon'
      }
    };
    
    EventBus.emit('core:errorDetectado', errorEvento);
  }
}

/**
 * Inicializa el distribuidor
 * Este método existe principalmente para mantener consistencia con otros componentes
 * y permitir futura expansión (por ejemplo, agregar monitoreo de eventos distribuidos)
 */
export function iniciarDistribuidor(): void {
  console.log('Distribuidor de eventos iniciado correctamente');
}
