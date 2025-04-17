/**
 * ws.ts
 * 
 * Implementa un servidor WebSocket nativo.
 * Recibe conexiones desde dispositivos en red local, escucha mensajes estructurados
 * y los emite al EventBus global sin transformación.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { getConfig } from '../config/config';
import { crearEventoBase } from '../utils/helpers';

// Almacena las conexiones activas para poder enviar mensajes a dispositivos específicos
const conexiones: Map<string, WebSocket> = new Map();

// Servidor WebSocket
let servidor: WebSocketServer | null = null;

/**
 * Inicia el servidor WebSocket en el puerto especificado
 * @param puerto Puerto donde escuchará el servidor WebSocket
 * @returns Instancia del servidor WebSocket
 */
export async function iniciarServidorWebSocket(puerto: number): Promise<WebSocketServer> {
  return new Promise((resolve, reject) => {
    try {
      // Crear instancia del servidor WebSocket
      servidor = new WebSocketServer({ port: puerto });
      
      // Configurar eventos del servidor
      configurarEventosServidor(servidor);
      
      // Resolver la promesa cuando el servidor esté escuchando
      servidor.on('listening', () => {
        console.log(`Servidor WebSocket iniciado en puerto ${puerto}`);
        resolve(servidor);
      });
      
      // Rechazar la promesa si hay un error al iniciar
      servidor.on('error', (error) => {
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Configura los eventos del servidor WebSocket
 * @param servidor Instancia del servidor WebSocket
 */
function configurarEventosServidor(servidor: WebSocketServer): void {
  // Evento de conexión
  servidor.on('connection', (socket, request) => {
    // Obtener IP del cliente (útil para logs)
    const ip = request.socket.remoteAddress || 'desconocida';
    console.log(`Nueva conexión desde ${ip}`);
    
    // Generar ID temporal para la conexión hasta que se identifique
    const conexionId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Almacenar la conexión con ID temporal
    conexiones.set(conexionId, socket);
    
    // Configurar eventos del socket
    configurarEventosSocket(socket, conexionId, ip);
  });
  
  // Evento de error del servidor
  servidor.on('error', (error) => {
    console.error('Error en servidor WebSocket:', error.message);
    
    // Emitir evento de error
    const evento = crearEventoBase('microservidor:errorConexion', {
      error: error.message,
      tipo: 'servidor',
      fecha: new Date().toISOString(),
      critico: true
    });
    
    global.eventBus.emit('microservidor:errorConexion', evento);
  });
  
  // Evento de cierre del servidor
  servidor.on('close', () => {
    console.log('Servidor WebSocket cerrado');
    
    // Limpiar todas las conexiones
    conexiones.clear();
  });
}

/**
 * Configura los eventos para un socket específico
 * @param socket Socket WebSocket
 * @param conexionId Identificador temporal de la conexión
 * @param ip Dirección IP del cliente
 */
function configurarEventosSocket(socket: WebSocket, conexionId: string, ip: string): void {
  let dispositivoId: string | null = null;
  
  // Evento de mensaje recibido
  socket.on('message', (mensaje) => {
    try {
      // Intentar parsear el mensaje como JSON
      const datos = JSON.parse(mensaje.toString());
      
      // Si el dispositivo aún no está identificado, intentar obtener su ID
      if (!dispositivoId && datos.contexto?.dispositivoId) {
        dispositivoId = datos.contexto.dispositivoId;
        
        // Actualizar el ID en el mapa de conexiones
        conexiones.delete(conexionId);
        conexiones.set(dispositivoId, socket);
        
        // Emitir evento de conexión establecida
        const eventoConexion = crearEventoBase('microservidor:conexionEstablecida', {
          dispositivoId,
          ip,
          fecha: new Date().toISOString()
        });
        
        global.eventBus.emit('microservidor:conexionEstablecida', eventoConexion);
        
        console.log(`Dispositivo identificado: ${dispositivoId}`);
      }
      
      // Emitir el evento entrante sin transformación
      global.eventBus.emit('microservidor:eventoEntrante', datos);
      
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
      
      // Emitir evento de error en el procesamiento
      const eventoError = crearEventoBase('microservidor:errorConexion', {
        error: 'Error al procesar mensaje JSON',
        ip,
        dispositivoId: dispositivoId || conexionId,
        fecha: new Date().toISOString()
      });
      
      global.eventBus.emit('microservidor:errorConexion', eventoError);
    }
  });
  
  // Evento de cierre de conexión
  socket.on('close', () => {
    console.log(`Conexión cerrada: ${dispositivoId || conexionId}`);
    
    // Eliminar la conexión del mapa
    if (dispositivoId) {
      conexiones.delete(dispositivoId);
    } else {
      conexiones.delete(conexionId);
    }
  });
  
  // Evento de error en la conexión
  socket.on('error', (error) => {
    console.error(`Error en conexión ${dispositivoId || conexionId}:`, error.message);
    
    // Emitir evento de error
    const eventoError = crearEventoBase('microservidor:errorConexion', {
      error: error.message,
      dispositivoId: dispositivoId || conexionId,
      fecha: new Date().toISOString()
    });
    
    global.eventBus.emit('microservidor:errorConexion', eventoError);
  });
}

/**
 * Cierra el servidor WebSocket
 */
export function cerrarServidorWebSocket(): void {
  if (servidor) {
    servidor.close();
    servidor = null;
    conexiones.clear();
    console.log('Servidor WebSocket cerrado');
  }
}

/**
 * Envía un mensaje a un dispositivo específico
 * @param dispositivoId ID del dispositivo destinatario
 * @param mensaje Mensaje a enviar (será convertido a JSON)
 * @returns true si el mensaje fue enviado, false si no se encontró el dispositivo
 */
export function enviarMensajeADispositivo(dispositivoId: string, mensaje: any): boolean {
  const conexion = conexiones.get(dispositivoId);
  
  if (conexion && conexion.readyState === WebSocket.OPEN) {
    conexion.send(JSON.stringify(mensaje));
    return true;
  }
  
  return false;
}

/**
 * Envía un mensaje a todos los dispositivos conectados
 * @param mensaje Mensaje a enviar (será convertido a JSON)
 * @returns Número de dispositivos a los que se envió el mensaje
 */
export function enviarMensajeATodos(mensaje: any): number {
  let enviados = 0;
  const mensajeJSON = JSON.stringify(mensaje);
  
  conexiones.forEach((conexion) => {
    if (conexion.readyState === WebSocket.OPEN) {
      conexion.send(mensajeJSON);
      enviados++;
    }
  });
  
  return enviados;
}

/**
 * Obtiene el número de conexiones activas
 * @returns Número de conexiones activas
 */
export function obtenerNumeroConexiones(): number {
  return conexiones.size;
}

/**
 * Obtiene la lista de IDs de dispositivos conectados
 * @returns Array de IDs de dispositivos
 */
export function obtenerDispositivosConectados(): string[] {
  return Array.from(conexiones.keys());
}
