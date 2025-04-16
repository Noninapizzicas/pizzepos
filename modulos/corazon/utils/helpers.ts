/**
 * helpers.ts
 * 
 * Funciones utilitarias puras para el módulo corazón, no ligadas a un dominio específico.
 * Incluye helpers para eventos, validación, fechas, logs, y una instancia global del EventBus.
 */

import mitt from 'mitt';
import { ZodSchema } from 'zod';

/**
 * Estructura estándar para los eventos del sistema
 */
export interface Evento {
  meta: {
    id: string;
    timestamp: string;
    tipo: string;
    origen: string;
    prioridad: number;
  };
  payload: Record<string, any>;
  contexto: {
    dispositivoId: string;
  };
}

/**
 * EventBus global para la comunicación entre módulos
 * Basado en 'mitt', una implementación ligera de EventEmitter
 */
export const EventBus = mitt();

/**
 * Genera un nuevo UUID v4
 * @returns UUID v4 como string
 */
export function generarUUID(): string {
  return crypto.randomUUID();
}

/**
 * Obtiene el timestamp actual en formato ISO
 * @returns Timestamp ISO actual
 */
export function timestampActual(): string {
  return new Date().toISOString();
}

/**
 * Crea un evento base con la estructura estándar del sistema
 * @param tipo Tipo del evento (ej: "core:eventoRecibido")
 * @param payload Datos específicos del evento
 * @param origen Módulo que origina el evento (default: "corazon")
 * @param prioridad Nivel de prioridad del evento (default: 5)
 * @param dispositivoId ID del dispositivo que origina el evento (default: "corazon")
 * @returns Objeto Evento con estructura completa
 */
export function crearEventoBase(
  tipo: string, 
  payload: Record<string, any>,
  origen: string = 'corazon',
  prioridad: number = 5,
  dispositivoId: string = 'corazon'
): Evento {
  return {
    meta: {
      id: generarUUID(),
      timestamp: timestampActual(),
      tipo,
      origen,
      prioridad
    },
    payload,
    contexto: {
      dispositivoId
    }
  };
}

/**
 * Valida datos contra un esquema Zod
 * @param schema Esquema Zod para validar
 * @param datos Datos a validar
 * @returns true si los datos son válidos, false si no
 */
export function validarEsquemaZod<T>(schema: ZodSchema<T>, datos: any): boolean {
  const resultado = schema.safeParse(datos);
  return resultado.success;
}

/**
 * Formatea un error para incluirlo en eventos
 * @param error Objeto de error a formatear
 * @returns String con información del error
 */
export function formatearError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}

/**
 * Verifica si un objeto es un evento válido con la estructura requerida
 * @param obj Objeto a verificar
 * @returns true si el objeto tiene la estructura básica de un evento, false si no
 */
export function esEventoValido(obj: any): obj is Evento {
  return obj &&
    typeof obj === 'object' &&
    obj.meta &&
    typeof obj.meta.id === 'string' &&
    typeof obj.meta.timestamp === 'string' &&
    typeof obj.meta.tipo === 'string' &&
    typeof obj.meta.origen === 'string' &&
    typeof obj.meta.prioridad === 'number' &&
    obj.payload &&
    typeof obj.payload === 'object' &&
    obj.contexto &&
    typeof obj.contexto.dispositivoId === 'string';
}

/**
 * Función utilitaria para desestructurar un path usando puntos
 * @param objeto Objeto a navegar
 * @param path Path con notación de puntos (ej: "sistema.config.valor")
 * @returns Valor encontrado o undefined si no existe
 */
export function obtenerPorPath(objeto: any, path: string): any {
  const partes = path.split('.');
  let actual = objeto;
  
  for (const parte of partes) {
    if (actual === undefined || actual === null) {
      return undefined;
    }
    actual = actual[parte];
  }
  
  return actual;
}

/**
 * Función para retardar la ejecución (útil para debugging)
 * @param ms Milisegundos a esperar
 * @returns Promesa que se resuelve después del tiempo especificado
 */
export function esperar(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
