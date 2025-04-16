/**
 * estado.ts
 * 
 * Almacena en memoria información compartida entre módulos: 
 * modo online/offline, configuración, módulos activos, sincronización, errores recientes.
 * No tiene persistencia, solo guarda estado en memoria durante la ejecución.
 */

import { z } from 'zod';
import { EventBus } from '../utils/helpers';

// Esquema de validación para la estructura mínima del estado
const EstadoBaseSchema = z.object({
  sistema: z.object({
    online: z.boolean().default(true),
    ultimaSincronizacion: z.number().default(0)
  }).default({}),
  modulos: z.record(z.object({
    activo: z.boolean().optional(),
    cargado: z.boolean().optional()
  })).default({}),
  errores: z.array(z.any()).default([])
});

// Tipo de estado derivado del esquema Zod
type EstadoBase = z.infer<typeof EstadoBaseSchema>;

// Estado global en memoria
let estadoGlobal: EstadoBase = {
  sistema: {
    online: true,
    ultimaSincronizacion: 0
  },
  modulos: {},
  errores: []
};

/**
 * Inicializa el estado del sistema con valores por defecto o un estado inicial proporcionado
 * @param valorInicial Estado inicial opcional
 */
export function iniciarEstado(valorInicial?: Record<string, any>): void {
  try {
    if (valorInicial) {
      // Si se proporciona un valor inicial, lo validamos y asignamos
      estadoGlobal = EstadoBaseSchema.parse({
        ...estadoGlobal,
        ...valorInicial
      });
    } else {
      // Si no hay valor inicial, validamos el estado por defecto
      estadoGlobal = EstadoBaseSchema.parse(estadoGlobal);
    }
    
    // Notificar que el estado se ha inicializado
    emitirEventoEstadoModificado('sistema', estadoGlobal.sistema, 'core');
  } catch (error) {
    emitirEventoError('Error al inicializar estado', error);
  }
}

/**
 * Obtiene el estado global completo
 * @returns Objeto de estado completo
 */
export function getEstado(): EstadoBase {
  return { ...estadoGlobal };
}

/**
 * Obtiene una sección específica del estado utilizando notación de punto
 * @param clave Ruta de acceso usando punto (ej: "sistema.online")
 * @returns Valor en la ruta especificada o undefined si no existe
 */
export function getEstadoPorClave(clave: string): any {
  try {
    const partes = clave.split('.');
    let actual: any = estadoGlobal;
    
    for (const parte of partes) {
      if (actual === undefined || actual === null) {
        return undefined;
      }
      actual = actual[parte];
    }
    
    return actual;
  } catch (error) {
    emitirEventoError(`Error al acceder a clave ${clave}`, error);
    return undefined;
  }
}

/**
 * Modifica una sección específica del estado y emite un evento de modificación
 * @param clave Ruta de acceso usando punto (ej: "sistema.online")
 * @param valor Nuevo valor a asignar
 * @param origen Identificador del módulo que realiza el cambio
 */
export function setEstadoPorClave(clave: string, valor: any, origen: string): void {
  try {
    const partes = clave.split('.');
    const ultimaParte = partes.pop();
    
    if (!ultimaParte) {
      throw new Error('Clave inválida');
    }
    
    let actual: any = estadoGlobal;
    
    // Navegar hasta el objeto que contiene la propiedad a modificar
    for (const parte of partes) {
      if (actual[parte] === undefined || actual[parte] === null) {
        actual[parte] = {};
      }
      actual = actual[parte];
    }
    
    // Modificar la propiedad
    actual[ultimaParte] = valor;
    
    // Emitir evento de modificación
    emitirEventoEstadoModificado(clave, valor, origen);
  } catch (error) {
    emitirEventoError(`Error al modificar clave ${clave}`, error);
  }
}

/**
 * Reinicia el estado a sus valores iniciales
 */
export function resetEstado(): void {
  try {
    estadoGlobal = EstadoBaseSchema.parse({
      sistema: {
        online: true,
        ultimaSincronizacion: 0
      },
      modulos: {},
      errores: []
    });
    
    // Emitir evento de reset
    emitirEventoEstadoReseteado();
  } catch (error) {
    emitirEventoError('Error al resetear estado', error);
  }
}

/**
 * Emite un evento informando que el estado ha sido modificado
 * @param clave Clave modificada
 * @param valor Nuevo valor
 * @param origen Módulo que realizó la modificación
 */
function emitirEventoEstadoModificado(clave: string, valor: any, origen: string): void {
  const evento = {
    meta: {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      tipo: 'core:estadoModificado',
      origen: 'corazon',
      prioridad: 5
    },
    payload: {
      clave,
      valor,
      origenCambio: origen
    },
    contexto: {
      dispositivoId: 'corazon'
    }
  };
  
  EventBus.emit('core:estadoModificado', evento);
}

/**
 * Emite un evento informando que el estado ha sido reseteado
 */
function emitirEventoEstadoReseteado(): void {
  const evento = {
    meta: {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      tipo: 'core:estadoReseteado',
      origen: 'corazon',
      prioridad: 8
    },
    payload: {
      nuevoEstado: estadoGlobal
    },
    contexto: {
      dispositivoId: 'corazon'
    }
  };
  
  EventBus.emit('core:estadoReseteado', evento);
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
      componente: 'estado'
    },
    contexto: {
      dispositivoId: 'corazon'
    }
  };
  
  EventBus.emit('core:errorDetectado', evento);
}
