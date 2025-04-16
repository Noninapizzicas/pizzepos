/**
 * index.ts
 * 
 * Punto de entrada del módulo 'corazon'.
 * Orquesta la carga de configuración, dispositivos, estado y eventos.
 * Exporta funciones limpias y emite eventos cuando el sistema está listo.
 */

import { cargarConfig, getConfig } from './config/config';
import { iniciarEstado, resetEstado } from './estado/estado';
import { cargarDispositivos } from './estado/registroDispositivos';
import { iniciarBroker, procesarEvento } from './eventos/broker';
import { iniciarDistribuidor } from './eventos/distribuidor';
import { EventBus, crearEventoBase } from './utils/helpers';

// Estado de inicialización
let corazonIniciado = false;

/**
 * Inicia el módulo corazon y todos sus componentes
 * Esta es la función principal que debe ser llamada para arrancar el sistema
 */
export async function iniciarCorazon(): Promise<void> {
  if (corazonIniciado) {
    console.warn('El módulo corazon ya ha sido iniciado');
    return;
  }

  try {
    // Registrar escuchas de eventos del sistema
    registrarListenersDelSistema();
    
    // Cargar configuración
    await cargarConfig();
    
    // Inicializar estado
    iniciarEstado();
    
    // Cargar dispositivos autorizados
    await cargarDispositivos();
    
    // Iniciar broker de eventos
    iniciarBroker();
    
    // Iniciar distribuidor de eventos
    iniciarDistribuidor();
    
    // Marcar como iniciado
    corazonIniciado = true;
    
    // Emitir evento de sistema listo
    emitirEventoSistemaListo();
    
    console.log('Módulo corazon iniciado correctamente');
    
  } catch (error) {
    // Emitir evento de error
    emitirEventoError('Error al iniciar el módulo corazon', error);
    
    // Relanzar el error para que el sistema pueda manejarlo
    throw error;
  }
}

/**
 * Reinicia el módulo corazon
 * Útil para situaciones de recuperación o actualización en caliente
 */
export async function reiniciarCorazon(): Promise<void> {
  try {
    // Reiniciar estado
    resetEstado();
    
    // Marcar como no iniciado
    corazonIniciado = false;
    
    // Emitir evento de reinicio
    const evento = crearEventoBase('core:reiniciando', {
      motivo: 'Reinicio manual del sistema',
      timestamp: new Date().toISOString()
    });
    
    EventBus.emit('core:reiniciando', evento);
    
    // Volver a iniciar
    await iniciarCorazon();
    
  } catch (error) {
    emitirEventoError('Error al reiniciar el módulo corazon', error);
    throw error;
  }
}

/**
 * Procesa un evento externo
 * Esta función expone el broker al exterior
 */
export function manejarEvento(evento: unknown): void {
  procesarEvento(evento);
}

/**
 * Registra los listeners de eventos del sistema
 */
function registrarListenersDelSistema(): void {
  // Escuchar evento de reinicio del sistema
  EventBus.on('core:reiniciarSistema', async () => {
    console.log('Recibido evento de reinicio del sistema');
    await reiniciarCorazon();
  });
  
  // Escuchar evento de modo offline
  EventBus.on('core:modoOffline', (evento) => {
    console.log('Cambiando a modo offline');
    
    // Actualizar estado del sistema
    import('./estado/estado').then(modulo => {
      modulo.setEstadoPorClave('sistema.online', false, 'core');
    });
  });
  
  // Escuchar evento de ping para monitoreo
  EventBus.on('core:ping', (evento) => {
    // Responder con un pong y estado básico del sistema
    const respuesta = crearEventoBase('core:pong', {
      timestamp: new Date().toISOString(),
      estado: 'activo',
      modulosActivos: getConfig().modulosDisponibles ? Object.keys(getConfig().modulosDisponibles).length : 0
    });
    
    EventBus.emit('core:pong', respuesta);
  });
  
  // Escuchar evento de log generado
  EventBus.on('core:logGenerado', (evento) => {
    // Este evento podría integrarse con el módulo de 'salida' para exportar logs
    // Por ahora solo lo registramos en consola
    console.log('Log generado:', evento.payload);
  });
}

/**
 * Emite un evento informando que el sistema está listo
 */
function emitirEventoSistemaListo(): void {
  const evento = crearEventoBase('core:listo', {
    timestamp: new Date().toISOString(),
    versión: getConfig().versionConfig || '1.0.0',
    modo: getConfig().inicializacion?.modoCarga || 'reactivo'
  });
  
  EventBus.emit('core:listo', evento);
}

/**
 * Emite un evento de error
 */
function emitirEventoError(mensaje: string, error: unknown): void {
  const evento = crearEventoBase('core:errorDetectado', {
    mensaje,
    error: String(error),
    componente: 'index',
    crítico: true
  }, 'corazon', 10);
  
  EventBus.emit('core:errorDetectado', evento);
  
  // Registrar en consola también
  console.error(`[ERROR CORE] ${mensaje}:`, error);
}
