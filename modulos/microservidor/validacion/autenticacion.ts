/**
 * autenticacion.ts
 * 
 * Verifica que un dispositivo tenga permiso para emitir o recibir eventos en el sistema.
 * Utiliza una lista de dispositivos previamente cargada desde dispositivos.json.
 */

import { z } from 'zod';
import { crearEventoBase } from '../utils/helpers';

// Esquema de validación para un dispositivo
export const DispositivoSchema = z.object({
  id: z.string().min(1, 'El ID del dispositivo no puede estar vacío'),
  llave: z.string().min(1, 'La llave del dispositivo no puede estar vacía'),
  activo: z.boolean(),
  rol: z.string().optional()
});

// Esquema para la lista completa de dispositivos
const ListaDispositivosSchema = z.array(DispositivoSchema);

// Tipo derivado del esquema
export type Dispositivo = z.infer<typeof DispositivoSchema>;

// Lista de dispositivos en memoria
let dispositivosAutorizados: Dispositivo[] = [];

/**
 * Valida si un dispositivo está autorizado para emitir o recibir eventos
 * @param id Identificador del dispositivo
 * @param llave Llave de autorización del dispositivo
 * @returns true si el dispositivo está autorizado, false si no
 */
export function esDispositivoAutorizado(id: string, llave: string): boolean {
  // Buscar el dispositivo en la lista
  const dispositivo = dispositivosAutorizados.find(d => d.id === id);
  
  // Verificar que exista, esté activo y tenga la llave correcta
  if (!dispositivo) {
    emitirEventoDispositivoNoAutorizado(id, 'Dispositivo no encontrado');
    return false;
  }
  
  if (!dispositivo.activo) {
    emitirEventoDispositivoNoAutorizado(id, 'Dispositivo inactivo');
    return false;
  }
  
  if (dispositivo.llave !== llave) {
    emitirEventoDispositivoNoAutorizado(id, 'Llave incorrecta');
    return false;
  }
  
  return true;
}

/**
 * Carga la lista de dispositivos autorizados
 * @param lista Array de dispositivos a cargar
 * @returns true si la carga fue exitosa, false si hubo errores
 */
export function cargarListaAutorizada(lista: unknown): boolean {
  try {
    // Validar la estructura de la lista
    const resultado = ListaDispositivosSchema.safeParse(lista);
    
    if (!resultado.success) {
      emitirEventoError('Estructura de dispositivos inválida', resultado.error);
      return false;
    }
    
    // Actualizar la lista en memoria
    dispositivosAutorizados = resultado.data;
    return true;
    
  } catch (error) {
    emitirEventoError('Error al cargar lista de dispositivos', error);
    return false;
  }
}

/**
 * Obtiene una copia de la lista de dispositivos autorizados
 * @returns Array con los dispositivos autorizados
 */
export function getDispositivosAutorizados(): Dispositivo[] {
  return [...dispositivosAutorizados];
}

/**
 * Valida la configuración de autenticación en general
 * @returns true si la configuración es válida, false si no
 */
export function validarConfiguracion(): boolean {
  // Verificar que haya dispositivos cargados
  if (dispositivosAutorizados.length === 0) {
    emitirEventoError('No hay dispositivos autorizados cargados', new Error('Lista vacía'));
    return false;
  }
  
  // Verificar que haya al menos un dispositivo activo
  const hayDispositivosActivos = dispositivosAutorizados.some(d => d.activo);
  if (!hayDispositivosActivos) {
    emitirEventoError('No hay dispositivos activos', new Error('Sin dispositivos activos'));
    return false;
  }
  
  return true;
}

/**
 * Busca un dispositivo por su ID
 * @param id Identificador del dispositivo
 * @returns El dispositivo si existe, undefined si no
 */
export function buscarDispositivo(id: string): Dispositivo | undefined {
  return dispositivosAutorizados.find(d => d.id === id);
}

/**
 * Emite un evento cuando un dispositivo no autorizado intenta conectarse
 * @param id Identificador del dispositivo
 * @param motivo Razón por la que no está autorizado
 */
function emitirEventoDispositivoNoAutorizado(id: string, motivo: string): void {
  const evento = crearEventoBase('microservidor:dispositivoNoAutorizado', {
    dispositivoId: id,
    motivo,
    fecha: new Date().toISOString()
  });
  
  // Emitir el evento a través del eventBus global
  if (global.eventBus) {
    global.eventBus.emit('microservidor:dispositivoNoAutorizado', evento);
  }
  
  // Registrar en consola también
  console.warn(`Dispositivo no autorizado: ${id} - ${motivo}`);
}

/**
 * Emite un evento de error
 * @param mensaje Mensaje descriptivo del error
 * @param error Objeto de error original
 */
function emitirEventoError(mensaje: string, error: unknown): void {
  const errorStr = error instanceof Error ? error.message : String(error);
  
  const evento = crearEventoBase('core:errorDetectado', {
    mensaje,
    error: errorStr,
    componente: 'autenticacion',
    modulo: 'microservidor'
  });
  
  // Emitir el evento a través del eventBus global
  if (global.eventBus) {
    global.eventBus.emit('core:errorDetectado', evento);
  }
  
  // Registrar en consola también
  console.error(`[ERROR] ${mensaje}: ${errorStr}`);
}
