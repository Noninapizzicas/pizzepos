/**
 * index.ts
 * 
 * Punto de entrada principal del módulo microservidor.
 * Orquesta la configuración e inicialización del WebSocket y del sistema de eventos.
 * Ejecuta el microservidor al correr `node index.ts`
 */

import { cargarConfig, getConfig } from './config/config';
import { iniciarServidorWebSocket } from './servidor/ws';
import { iniciarManejadorEventos } from './eventos/manejadorEventos';
import { validarConfiguracion } from './validacion/autenticacion';
import { formatearFecha, crearEventoBase } from './utils/helpers';

// Estado del servidor
let servidorIniciado = false;

/**
 * Función principal para iniciar el microservidor
 */
async function iniciarMicroservidor(): Promise<void> {
  // Fecha de inicio para logs
  const fechaInicio = formatearFecha(new Date());
  console.log(`[${fechaInicio}] Iniciando microservidor PizzePOS...`);

  try {
    // 1. Cargar y validar configuración
    console.log('Cargando configuración...');
    await cargarConfig();
    
    // 2. Validar estructura de la configuración
    console.log('Validando configuración...');
    const configValida = validarConfiguracion();
    
    if (!configValida) {
      throw new Error('La configuración no es válida. Revise config.ts y dispositivos.json');
    }
    
    // 3. Iniciar el manejador de eventos
    console.log('Iniciando sistema de eventos...');
    iniciarManejadorEventos();
    
    // 4. Iniciar el servidor WebSocket
    console.log('Iniciando servidor WebSocket...');
    const config = getConfig();
    const puerto = config.servidor?.puerto || 8080;
    const servidor = await iniciarServidorWebSocket(puerto);
    
    // 5. Marcar como iniciado y emitir evento de listo
    servidorIniciado = true;
    const evento = crearEventoBase('microservidor:listo', {
      puerto,
      fecha: new Date().toISOString(),
      version: config.version || '1.0.0'
    });
    
    // Emitir el evento a través del manejador de eventos
    global.eventBus.emit('microservidor:listo', evento);
    
    console.log(`[${formatearFecha(new Date())}] Microservidor iniciado correctamente en puerto ${puerto}`);
    
    // 6. Configurar manejador de cierre para una terminación limpia
    configurarCierreControlado();
    
  } catch (error) {
    manejarErrorInicio(error);
  }
}

/**
 * Maneja errores durante el inicio del servidor
 */
function manejarErrorInicio(error: unknown): void {
  const errorMsg = error instanceof Error ? error.message : String(error);
  console.error(`[ERROR] Falló el inicio del microservidor: ${errorMsg}`);
  
  // Crear y emitir evento de error
  const evento = crearEventoBase('microservidor:errorConexion', {
    error: errorMsg,
    fecha: new Date().toISOString(),
    critico: true
  });
  
  // Si el eventBus ya está inicializado, emitir eventos
  if (global.eventBus) {
    global.eventBus.emit('microservidor:errorConexion', evento);
    global.eventBus.emit('core:errorDetectado', {
      ...evento,
      meta: {
        ...evento.meta,
        tipo: 'core:errorDetectado'
      }
    });
  }
  
  // Terminar el proceso con código de error
  process.exit(1);
}

/**
 * Configura los manejadores para un cierre controlado del servidor
 */
function configurarCierreControlado(): void {
  // Manejar señales de terminación
  process.on('SIGINT', () => cerrarServidor('SIGINT'));
  process.on('SIGTERM', () => cerrarServidor('SIGTERM'));
  
  // Manejar excepciones no capturadas
  process.on('uncaughtException', (error) => {
    console.error(`[ERROR] Excepción no capturada: ${error.message}`);
    cerrarServidor('uncaughtException');
  });
}

/**
 * Cierra el servidor de manera controlada
 */
async function cerrarServidor(motivo: string): Promise<void> {
  console.log(`[${formatearFecha(new Date())}] Cerrando microservidor (motivo: ${motivo})...`);
  
  // Emitir evento de cierre si el servidor estaba funcionando
  if (servidorIniciado && global.eventBus) {
    const evento = crearEventoBase('microservidor:apagando', {
      motivo,
      fecha: new Date().toISOString()
    });
    
    global.eventBus.emit('microservidor:apagando', evento);
    
    // Dar tiempo para que se procesen los eventos pendientes
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Terminar el proceso
  process.exit(0);
}

// Ejecutar el microservidor inmediatamente
iniciarMicroservidor();

// Exponer para uso desde otros módulos
export { iniciarMicroservidor };
