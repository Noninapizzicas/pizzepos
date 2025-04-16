/**
 * registroDispositivos.ts
 * 
 * Se encarga de cargar y exponer la lista de dispositivos autorizados desde el archivo dispositivos.json.
 * No tiene persistencia, solo trabaja en memoria.
 * Valida con Zod, emite eventos si hay errores o éxito, y expone funciones puras para acceso controlado.
 */

import { z } from 'zod';
import { EventBus } from '../utils/helpers';
import { cargarDispositivosAutorizados } from '../validacion/llaves';
import { almacenamiento } from '../../almacenamiento'; // Módulo externo para acceso a archivos

// Esquema de validación para cada dispositivo
export const DispositivoSchema = z.object({
  id: z.string().min(1),
  llave: z.string().min(1),
  activo: z.boolean(),
  rol: z.string().optional()
});

// Esquema para el array completo de dispositivos
const DispositivosSchema = z.array(DispositivoSchema);

// Tipo derivado del esquema
export type DispositivoAutorizado = z.infer<typeof DispositivoSchema>;

// Lista de dispositivos en memoria
let dispositivosAutorizados: DispositivoAutorizado[] = [];

/**
 * Carga la lista inicial de dispositivos desde almacenamiento y la valida
 */
export async function cargarDispositivos(): Promise<void> {
  try {
    // Ruta del archivo de dispositivos
    const rutaArchivo = '/config/dispositivos.json';
    
    // Obtener el contenido del archivo desde el módulo de almacenamiento
    const contenido = await almacenamiento.leerArchivo(rutaArchivo);
    
    if (!contenido) {
      throw new Error(`No se pudo leer el archivo de dispositivos: ${rutaArchivo}`);
    }
    
    // Parsear el JSON
    const datos = JSON.parse(contenido);
    
    // Validar la estructura con Zod
    const resultado = DispositivosSchema.safeParse(datos);
    
    if (!resultado.success) {
      throw new Error(`Estructura inválida en archivo de dispositivos: ${resultado.error.message}`);
    }
    
    // Guardar los dispositivos en memoria
    dispositivosAutorizados = resultado.data;
    
    // Actualizar el módulo de validación de llaves con los nuevos dispositivos
    cargarDispositivosAutorizados(dispositivosAutorizados);
    
    // Emitir evento de éxito
    emitirEventoDispositivosCargados();
    
  } catch (error) {
    // Emitir evento de error
    emitirEventoError('Error al cargar dispositivos', error);
  }
}

/**
 * Permite recargar el archivo de dispositivos en caliente, reemplazando la lista actual
 */
export async function recargarDispositivos(): Promise<void> {
  // Simplemente reutilizamos la función de carga inicial
  await cargarDispositivos();
}

/**
 * Devuelve la lista completa de dispositivos autorizados
 * @returns Array de dispositivos autorizados
 */
export function getDispositivos(): DispositivoAutorizado[] {
  // Devolvemos una copia para evitar modificaciones externas
  return [...dispositivosAutorizados];
}

/**
 * Devuelve un dispositivo específico por ID
 * @param id Identificador del dispositivo
 * @returns Dispositivo si existe, undefined si no
 */
export function getDispositivoPorId(id: string): DispositivoAutorizado | undefined {
  return dispositivosAutorizados.find(dispositivo => dispositivo.id === id);
}

/**
 * Verifica si un dispositivo está activo
 * @param id Identificador del dispositivo
 * @returns true si el dispositivo existe y está activo, false en caso contrario
 */
export function esDispositivoActivo(id: string): boolean {
  const dispositivo = getDispositivoPorId(id);
  return dispositivo ? dispositivo.activo : false;
}

/**
 * Emite un evento informando que se han cargado los dispositivos
 */
function emitirEventoDispositivosCargados(): void {
  const evento = {
    meta: {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      tipo: 'core:dispositivosCargados',
      origen: 'corazon',
      prioridad: 5
    },
    payload: {
      cantidadDispositivos: dispositivosAutorizados.length,
      dispositivosActivos: dispositivosAutorizados.filter(d => d.activo).length
    },
    contexto: {
      dispositivoId: 'corazon'
    }
  };
  
  EventBus.emit('core:dispositivosCargados', evento);
}

/**
 * Emite un evento de error
 * @param mensaje Mensaje descriptivo del error
 * @param error Objeto de error original
 */
function emitirEventoError(mensaje: string, error: unknown): void {
  const evento = {
    meta: {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      tipo: 'core:errorDetectado',
      origen: 'corazon',
      prioridad: 9
    },
    payload: {
      mensaje,
      error: String(error),
      componente: 'registroDispositivos'
    },
    contexto: {
      dispositivoId: 'corazon'
    }
  };
  
  EventBus.emit('core:errorDetectado', evento);
}
