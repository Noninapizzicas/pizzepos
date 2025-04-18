/**
 * validador.ts
 * 
 * Sistema de validación para archivos JSON del sistema PizzePOS.
 * Valida la estructura de los datos según plantillas específicas para cada tipo.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { EventEmitter } from 'events';

// EventBus global o local según la configuración del sistema
const eventBus = global.eventBus || new EventEmitter();

// Ruta base para las plantillas de validación
const RUTA_PLANTILLAS = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), 'datos', 'almacenamiento', 'plantillas')
  : path.join(process.cwd(), 'src', 'datos', 'almacenamiento', 'plantillas');

// Caché de esquemas para evitar leer del disco repetidamente
const cacheEsquemas = new Map<string, z.ZodType<any>>();

/**
 * Valida un archivo JSON contra su plantilla correspondiente
 * @param contenido Contenido del archivo a validar
 * @param tipo Tipo de archivo (productos, variaciones, etc.)
 * @returns Promise<boolean> - true si es válido, false si no
 */
export async function validarArchivo(contenido: string, tipo: string): Promise<boolean> {
  try {
    // Parsear el contenido como JSON
    const datos = JSON.parse(contenido);
    
    // Cargar o obtener el esquema de validación
    const esquema = await obtenerEsquema(tipo);
    
    if (!esquema) {
      throw new Error(`No se encontró plantilla de validación para ${tipo}`);
    }
    
    // Validar los datos contra el esquema
    const resultado = esquema.safeParse(datos);
    
    if (resultado.success) {
      // Emitir evento de validación exitosa
      emitirEventoValidacionExitosa(tipo, datos);
      return true;
    } else {
      // Emitir evento de validación fallida con errores
      const errores = procesarErroresZod(resultado.error);
      emitirEventoValidacionFallida(tipo, errores);
      return false;
    }
    
  } catch (error) {
    // Error crítico (no se pudo parsear JSON, error de lectura, etc.)
    emitirEventoError(`Error al validar archivo ${tipo}`, error);
    return false;
  }
}

/**
 * Valida datos ya parseados contra su plantilla
 * @param datos Datos ya parseados como objeto
 * @param tipo Tipo de archivo
 * @returns Promise<boolean> - true si es válido, false si no
 */
export async function validarDatos(datos: any, tipo: string): Promise<boolean> {
  try {
    // Cargar o obtener el esquema de validación
    const esquema = await obtenerEsquema(tipo);
    
    if (!esquema) {
      throw new Error(`No se encontró plantilla de validación para ${tipo}`);
    }
    
    // Validar los datos contra el esquema
    const resultado = esquema.safeParse(datos);
    
    if (resultado.success) {
      // Emitir evento de validación exitosa
      emitirEventoValidacionExitosa(tipo, datos);
      return true;
    } else {
      // Emitir evento de validación fallida con errores
      const errores = procesarErroresZod(resultado.error);
      emitirEventoValidacionFallida(tipo, errores);
      return false;
    }
    
  } catch (error) {
    // Error crítico
    emitirEventoError(`Error al validar datos ${tipo}`, error);
    return false;
  }
}

/**
 * Obtiene el esquema de validación para un tipo de archivo
 * @param tipo Tipo de archivo
 * @returns Esquema Zod para validación o null si no existe
 */
async function obtenerEsquema(tipo: string): Promise<z.ZodType<any> | null> {
  // Verificar si ya está en caché
  if (cacheEsquemas.has(tipo)) {
    return cacheEsquemas.get(tipo) || null;
  }
  
  try {
    // Nombre del archivo de plantilla
    const nombreArchivo = `${tipo}.plantilla.json`;
    const rutaPlantilla = path.join(RUTA_PLANTILLAS, nombreArchivo);
    
    // Leer la plantilla
    const contenido = await fs.readFile(rutaPlantilla, 'utf8');
    const plantilla = JSON.parse(contenido);
    
    // Convertir la plantilla JSON a un esquema Zod
    const esquema = generarEsquemaDesdeJSON(plantilla);
    
    // Guardar en caché
    cacheEsquemas.set(tipo, esquema);
    
    return esquema;
    
  } catch (error) {
    console.warn(`No se pudo cargar plantilla para ${tipo}:`, error);
    emitirEventoError(`Error al cargar plantilla para ${tipo}`, error);
    return null;
  }
}

/**
 * Genera un esquema Zod a partir de un objeto JSON
 * @param plantilla Objeto JSON que sirve como plantilla
 * @returns Esquema Zod generado
 */
function generarEsquemaDesdeJSON(plantilla: any): z.ZodType<any> {
  // Esta función recursiva convierte un objeto JSON en un esquema Zod
  function convertir(valor: any): z.ZodType<any> {
    if (valor === null) {
      return z.null();
    }
    
    if (Array.isArray(valor)) {
      if (valor.length === 0) {
        // Array vacío, aceptamos cualquier array
        return z.array(z.any());
      } else {
        // Array con elementos, generamos un esquema basado en el primer elemento
        const elementoEsquema = convertir(valor[0]);
        return z.array(elementoEsquema);
      }
    }
    
    switch (typeof valor) {
      case 'string':
        return z.string();
      case 'number':
        return z.number();
      case 'boolean':
        return z.boolean();
      case 'object': {
        // Crear un esquema de objeto con propiedades
        const propiedades: Record<string, z.ZodType<any>> = {};
        
        for (const key in valor) {
          propiedades[key] = convertir(valor[key]);
        }
        
        return z.object(propiedades);
      }
      default:
        return z.any();
    }
  }
  
  return convertir(plantilla);
}

/**
 * Procesa los errores de Zod para hacerlos más legibles
 * @param error Error de Zod
 * @returns Array de mensajes de error legibles
 */
function procesarErroresZod(error: z.ZodError): string[] {
  return error.errors.map(err => {
    const ruta = err.path.join('.');
    return `Campo ${ruta}: ${err.message}`;
  });
}

/**
 * Emite un evento de validación exitosa
 * @param tipo Tipo de archivo validado
 * @param datos Datos validados
 */
function emitirEventoValidacionExitosa(tipo: string, datos: any): void {
  eventBus.emit('almacenamiento:validacionExitosa', {
    tipo,
    timestamp: new Date().toISOString(),
    tamaño: JSON.stringify(datos).length,
    campos: Object.keys(datos)
  });
}

/**
 * Emite un evento de validación fallida
 * @param tipo Tipo de archivo validado
 * @param errores Lista de errores encontrados
 */
function emitirEventoValidacionFallida(tipo: string, errores: string[]): void {
  eventBus.emit('almacenamiento:validacionFallida', {
    tipo,
    timestamp: new Date().toISOString(),
    errores
  });
}

/**
 * Emite un evento de error general
 * @param mensaje Mensaje descriptivo del error
 * @param error Objeto de error original
 */
function emitirEventoError(mensaje: string, error: unknown): void {
  const errorObj = {
    mensaje,
    error: String(error),
    timestamp: new Date().toISOString(),
    componente: 'validador'
  };
  
  eventBus.emit('almacenamiento:error', errorObj);
  eventBus.emit('core:errorDetectado', errorObj);
}

/**
 * Crea una plantilla a partir de un conjunto de datos
 * @param datos Datos a usar como base para la plantilla
 * @param tipo Tipo de archivo
 * @returns Promise<boolean> - true si se guardó la plantilla, false si no
 */
export async function generarPlantilla(datos: any, tipo: string): Promise<boolean> {
  try {
    // Nombre del archivo de plantilla
    const nombreArchivo = `${tipo}.plantilla.json`;
    const rutaPlantilla = path.join(RUTA_PLANTILLAS, nombreArchivo);
    
    // Guardar los datos como plantilla
    await fs.writeFile(rutaPlantilla, JSON.stringify(datos, null, 2), 'utf8');
    
    // Actualizar o crear el esquema en caché
    const esquema = generarEsquemaDesdeJSON(datos);
    cacheEsquemas.set(tipo, esquema);
    
    console.log(`Plantilla generada para ${tipo}`);
    return true;
    
  } catch (error) {
    console.error(`Error al generar plantilla para ${tipo}:`, error);
    emitirEventoError(`Error al generar plantilla para ${tipo}`, error);
    return false;
  }
}

/**
 * Limpia la caché de esquemas
 */
export function limpiarCache(): void {
  cacheEsquemas.clear();
}

export default {
  validarArchivo,
  validarDatos,
  generarPlantilla,
  limpiarCache
};
