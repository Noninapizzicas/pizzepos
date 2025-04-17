/**
 * manejadorEventos.ts
 * 
 * Implementa el "bus de eventos" principal del microservidor.
 * Centraliza el manejo de todos los eventos internos del módulo microservidor.
 * Permite que los distintos componentes se comuniquen entre sí.
 */

import { EventEmitter } from 'events';
import { enviarMensajeADispositivo, enviarMensajeATodos } from '../servidor/ws';

// Declarar el tipo para global.eventBus
declare global {
  var eventBus: EventEmitter;
}

// Crear instancia de EventEmitter
const eventBus = new EventEmitter();

// Configurar límites para evitar memory leaks
eventBus.setMaxListeners(50);

// Asignar a global para acceso desde cualquier parte del módulo
global.eventBus = eventBus;

/**
 * Inicia el manejador de eventos y configura los listeners principales
 */
export function iniciarManejadorEventos(): void {
  console.log('Iniciando manejador de eventos del microservidor...');
  
  // Configurar listeners para eventos del core
  configurarListenersEventosCore();
  
  // Configurar listeners para eventos internos del microservidor
  configurarListenersEventosInternos();
}

/**
 * Configura listeners para eventos que vienen del módulo core
 */
function configurarListenersEventosCore(): void {
  // Escuchar eventos distribuidos por el core para reenviarlos a los dispositivos
  eventBus.on('core:eventoDistribuido', (evento) => {
    console.log(`Recibido evento distribuido: ${evento.meta.tipo}`);
    
    // Si el evento tiene un destinatario específico, enviarlo solo a ese dispositivo
    if (evento.destinatario) {
      enviarMensajeADispositivo(evento.destinatario, evento);
    } else {
      // Si no tiene destinatario específico, enviar a todos los dispositivos conectados
      enviarMensajeATodos(evento);
    }
  });
  
  // Escuchar revocaciones de llaves para desconectar dispositivos no autorizados
  eventBus.on('core:llaveRevocada', (evento) => {
    console.log(`Llave revocada para dispositivo: ${evento.payload.dispositivoId}`);
    
    // Emitir evento interno para que el servidor WebSocket cierre la conexión
    eventBus.emit('microservidor:cerrarConexion', {
      dispositivoId: evento.payload.dispositivoId,
      motivo: 'Llave revocada por el sistema'
    });
  });
}

/**
 * Configura listeners para eventos internos del microservidor
 */
function configurarListenersEventosInternos(): void {
  // Escuchar eventos entrantes desde WebSocket para reenviarlos al core
  eventBus.on('microservidor:eventoEntrante', (evento) => {
    console.log(`Evento entrante recibido: ${evento.meta?.tipo || 'sin tipo'}`);
    
    // Reenviar el evento al core (módulo corazon)
    if (evento.meta && evento.meta.tipo) {
      eventBus.emit('core:procesarEvento', evento);
    }
  });
  
  // Escuchar errores de conexión para registrarlos
  eventBus.on('microservidor:errorConexion', (evento) => {
    console.error(`Error de conexión: ${evento.payload.error}`);
    
    // Reenviar errores críticos al core
    if (evento.payload.critico) {
      eventBus.emit('core:errorDetectado', {
        meta: {
          id: evento.meta.id,
          timestamp: evento.meta.timestamp,
          tipo: 'core:errorDetectado',
          origen: 'microservidor',
          prioridad: 9 // Alta prioridad para errores críticos
        },
        payload: {
          mensaje: `Error en microservidor: ${evento.payload.error}`,
          error: evento.payload.error,
          componente: evento.payload.componente || 'microservidor'
        },
        contexto: {
          dispositivoId: 'microservidor'
        }
      });
    }
  });
}

/**
 * Emite un evento en el bus global
 * @param tipo Tipo de evento (formato 'modulo:evento')
 * @param datos Datos del evento
 */
export function emitirEventoGlobal(tipo: string, datos: any): void {
  eventBus.emit(tipo, datos);
}

/**
 * Suscribe un callback a un tipo de evento
 * @param tipo Tipo de evento a escuchar
 * @param callback Función a ejecutar cuando ocurra el evento
 */
export function suscribirseEvento(tipo: string, callback: (datos: any) => void): void {
  eventBus.on(tipo, callback);
}

/**
 * Elimina una suscripción a un evento
 * @param tipo Tipo de evento
 * @param callback Función a eliminar
 */
export function desuscribirseEvento(tipo: string, callback: (datos: any) => void): void {
  eventBus.off(tipo, callback);
}

/**
 * Obtiene el número actual de listeners para un evento
 * @param tipo Tipo de evento
 * @returns Número de listeners para el evento
 */
export function obtenerNumeroListeners(tipo: string): number {
  return eventBus.listenerCount(tipo);
}
