/**
 * gestorArchivos.ts
 * 
 * Centraliza las operaciones de archivos para el módulo de almacenamiento de PizzePOS.
 * Maneja lectura, escritura, validación, eliminación y respaldo de archivos JSON.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { EventEmitter } from 'events';

// EventBus global o local según la configuración del sistema
const eventBus = global.eventBus || new EventEmitter();

// Directorio base para archivos de datos
const DIRECTORIO_BASE = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), 'datos')
  : path.join(process.cwd(), 'src', 'datos');

// Directorio para respaldos
const DIRECTORIO_RESPALDOS = path.join(DIRECTORIO_BASE, 'respaldos');

/**
 * Lee un archivo desde el sistema de archivos
 * @param ruta Ruta al archivo (relativa o absoluta)
 * @returns Promise con el contenido del archivo o null si hay error
 */
export async function leerArchivo(ruta: string): Promise<string | null> {
  try {
    // Resolver ruta (si es relativa, se basa en DIRECTORIO_BASE)
    const rutaCompleta = esRutaAbsoluta(ruta) ? ruta : path.join(DIRECTORIO_BASE, ruta);
    
    // Leer archivo
    const contenido = await fs.readFile(rutaCompleta, 'utf8');
    
    // Emitir evento de lectura exitosa
    emitirEventoArchivoLeido(rutaCompleta, contenido.length);
    
    return contenido;
  } catch (error) {
    console.error(`Error al leer archivo ${ruta}:`, error);
    emitirEventoError(`Error al leer archivo ${ruta}`, error);
    return null;
  }
}

/**
 * Guarda un archivo en el sistema de archivos
 * @param ruta Ruta donde guardar el archivo (relativa o absoluta)
 * @param contenido Contenido a guardar
 * @returns Promise<boolean> indicando éxito o fallo
 */
export async function guardarArchivo(ruta: string, contenido: string): Promise<boolean> {
  try {
    // Resolver ruta completa
    const rutaCompleta = esRutaAbsoluta(ruta) ? ruta : path.join(DIRECTORIO_BASE, ruta);
    
    // Asegurar que el directorio existe
    await crearDirectorioSiNoExiste(path.dirname(rutaCompleta));
    
    // Crear respaldo si el archivo ya existe
    await hacerBackup(rutaCompleta);
    
    // Guardar archivo
    await fs.writeFile(rutaCompleta, contenido, 'utf8');
    
    // Emitir evento de guardado exitoso
    emitirEventoArchivoGuardado(rutaCompleta, contenido.length);
    
    return true;
  } catch (error) {
    console.error(`Error al guardar archivo ${ruta}:`, error);
    emitirEventoError(`Error al guardar archivo ${ruta}`, error);
    return false;
  }
}

/**
 * Guarda un objeto como JSON en el sistema de archivos
 * @param ruta Ruta donde guardar el archivo (relativa o absoluta)
 * @param datos Objeto a serializar como JSON
 * @param formatear Si es true, formatea el JSON con indentación (default: true)
 * @returns Promise<boolean> indicando éxito o fallo
 */
export async function guardarJSON<T>(ruta: string, datos: T, formatear: boolean = true): Promise<boolean> {
  try {
    // Convertir objeto a JSON
    const contenido = formatear 
      ? JSON.stringify(datos, null, 2) 
      : JSON.stringify(datos);
      
    // Guardar usando la función general
    return await guardarArchivo(ruta, contenido);
  } catch (error) {
    console.error(`Error al serializar o guardar JSON en ${ruta}:`, error);
    emitirEventoError(`Error al guardar JSON en ${ruta}`, error);
    return false;
  }
}

/**
 * Lee y parsea un archivo JSON
 * @param ruta Ruta al archivo JSON (relativa o absoluta)
 * @returns Promise con el objeto parseado o null si hay error
 */
export async function leerJSON<T>(ruta: string): Promise<T | null> {
  try {
    // Leer el archivo
    const contenido = await leerArchivo(ruta);
    
    // Si no hay contenido, retornar null
    if (contenido === null) {
      return null;
    }
    
    // Parsear JSON
    return JSON.parse(contenido) as T;
  } catch (error) {
    console.error(`Error al parsear JSON desde ${ruta}:`, error);
    emitirEventoError(`Error al parsear JSON desde ${ruta}`, error);
    return null;
  }
}

/**
 * Valida un archivo contra un esquema Zod
 * @param ruta Ruta al archivo a validar
 * @param esquema Esquema Zod para validación
 * @returns Promise<boolean> indicando si el archivo es válido
 */
export async function validarArchivo<T>(ruta: string, esquema: z.ZodType<T>): Promise<boolean> {
  try {
    // Leer y parsear el archivo
    const datos = await leerJSON<unknown>(ruta);
    
    // Si no se pudo leer, retornar false
    if (datos === null) {
      return false;
    }
    
    // Validar contra el esquema
    const resultado = esquema.safeParse(datos);
    
    if (resultado.success) {
      return true;
    } else {
      // Procesar errores para hacerlos más legibles
      const errores = resultado.error.errors.map(err => {
        const ruta = err.path.join('.');
        return `Campo ${ruta}: ${err.message}`;
      });
      
      // Emitir evento de archivo inválido
      emitirEventoArchivoInvalido(ruta, errores);
      
      return false;
    }
  } catch (error) {
    console.error(`Error al validar archivo ${ruta}:`, error);
    emitirEventoError(`Error al validar archivo ${ruta}`, error);
    return false;
  }
}

/**
 * Elimina un archivo del sistema
 * @param ruta Ruta al archivo a eliminar (relativa o absoluta)
 * @param hacerRespaldo Si es true, crea un respaldo antes de eliminar (default: true)
 * @returns Promise<boolean> indicando éxito o fallo
 */
export async function eliminarArchivo(ruta: string, hacerRespaldo: boolean = true): Promise<boolean> {
  try {
    // Resolver ruta completa
    const rutaCompleta = esRutaAbsoluta(ruta) ? ruta : path.join(DIRECTORIO_BASE, ruta);
    
    // Verificar que el archivo existe
    try {
      await fs.access(rutaCompleta);
    } catch {
      // Si el archivo no existe, considerar exitosa la eliminación
      return true;
    }
    
    // Si se solicita respaldo, crearlo antes de eliminar
    if (hacerRespaldo) {
      await hacerBackup(rutaCompleta);
    }
    
    // Eliminar archivo
    await fs.unlink(rutaCompleta);
    
    // Emitir evento de eliminación exitosa
    emitirEventoArchivoEliminado(rutaCompleta);
    
    return true;
  } catch (error) {
    console.error(`Error al eliminar archivo ${ruta}:`, error);
    emitirEventoError(`Error al eliminar archivo ${ruta}`, error);
    return false;
  }
}

/**
 * Crea una copia de respaldo de un archivo
 * @param ruta Ruta al archivo a respaldar (relativa o absoluta)
 * @returns Promise<boolean> indicando éxito o fallo
 */
export async function hacerBackup(ruta: string): Promise<boolean> {
  try {
    // Resolver ruta completa
    const rutaCompleta = esRutaAbsoluta(ruta) ? ruta : path.join(DIRECTORIO_BASE, ruta);
    
    // Verificar que el archivo existe
    try {
      await fs.access(rutaCompleta);
    } catch {
      // Si el archivo no existe, no hay nada que respaldar
      return false;
    }
    
    // Crear directorio de respaldos si no existe
    await crearDirectorioSiNoExiste(DIRECTORIO_RESPALDOS);
    
    // Generar nombre único para el respaldo
    const nombreBase = path.basename(rutaCompleta);
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const nombreRespaldo = `${path.parse(nombreBase).name}_${timestamp}${path.parse(nombreBase).ext}`;
    const rutaRespaldo = path.join(DIRECTORIO_RESPALDOS, nombreRespaldo);
    
    // Copiar archivo a respaldo
    await fs.copyFile(rutaCompleta, rutaRespaldo);
    
    // Emitir evento de respaldo exitoso
    emitirEventoBackupRealizado(rutaCompleta, rutaRespaldo);
    
    return true;
  } catch (error) {
    console.error(`Error al crear respaldo de ${ruta}:`, error);
    emitirEventoError(`Error al crear respaldo de ${ruta}`, error);
    return false;
  }
}

/**
 * Verifica si un archivo existe
 * @param ruta Ruta al archivo (relativa o absoluta)
 * @returns Promise<boolean> indicando si el archivo existe
 */
export async function existeArchivo(ruta: string): Promise<boolean> {
  try {
    // Resolver ruta completa
    const rutaCompleta = esRutaAbsoluta(ruta) ? ruta : path.join(DIRECTORIO_BASE, ruta);
    
    // Verificar acceso
    await fs.access(rutaCompleta);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lista archivos en un directorio
 * @param rutaDirectorio Ruta al directorio (relativa o absoluta)
 * @param extension Filtrar por extensión (ej: ".json")
 * @returns Promise con array de nombres de archivo o null si hay error
 */
export async function listarArchivos(rutaDirectorio: string, extension?: string): Promise<string[] | null> {
  try {
    // Resolver ruta completa
    const rutaCompleta = esRutaAbsoluta(rutaDirectorio) 
      ? rutaDirectorio 
      : path.join(DIRECTORIO_BASE, rutaDirectorio);
    
    // Listar archivos
    const archivos = await fs.readdir(rutaCompleta);
    
    // Filtrar por extensión si se especifica
    if (extension) {
      return archivos.filter(archivo => path.extname(archivo) === extension);
    }
    
    return archivos;
  } catch (error) {
    console.error(`Error al listar archivos en ${rutaDirectorio}:`, error);
    emitirEventoError(`Error al listar archivos en ${rutaDirectorio}`, error);
    return null;
  }
}

/**
 * Crea un directorio si no existe
 * @param ruta Ruta del directorio a crear
 */
async function crearDirectorioSiNoExiste(ruta: string): Promise<void> {
  try {
    await fs.mkdir(ruta, { recursive: true });
  } catch (error) {
    console.error(`Error al crear directorio ${ruta}:`, error);
    throw error; // Re-lanzar para manejo externo
  }
}

/**
 * Verifica si una ruta es absoluta
 * @param ruta Ruta a verificar
 * @returns true si es absoluta, false si es relativa
 */
function esRutaAbsoluta(ruta: string): boolean {
  return path.isAbsolute(ruta);
}

/**
 * Emite evento de archivo leído
 * @param ruta Ruta del archivo
 * @param tamano Tamaño en bytes
 */
function emitirEventoArchivoLeido(ruta: string, tamano: number): void {
  eventBus.emit('almacenamiento:archivoLeido', {
    ruta: path.basename(ruta),
    tamano,
    timestamp: new Date().toISOString()
  });
}

/**
 * Emite evento de archivo guardado
 * @param ruta Ruta del archivo
 * @param tamano Tamaño en bytes
 */
function emitirEventoArchivoGuardado(ruta: string, tamano: number): void {
  eventBus.emit('almacenamiento:archivoGuardado', {
    ruta: path.basename(ruta),
    tamano,
    timestamp: new Date().toISOString()
  });
}

/**
 * Emite evento de archivo eliminado
 * @param ruta Ruta del archivo
 */
function emitirEventoArchivoEliminado(ruta: string): void {
  eventBus.emit('almacenamiento:archivoEliminado', {
    ruta: path.basename(ruta),
    timestamp: new Date().toISOString()
  });
}

/**
 * Emite evento de archivo inválido
 * @param ruta Ruta del archivo
 * @param errores Lista de errores encontrados
 */
function emitirEventoArchivoInvalido(ruta: string, errores: string[]): void {
  eventBus.emit('almacenamiento:archivoInvalido', {
    ruta: path.basename(ruta),
    errores,
    timestamp: new Date().toISOString()
  });
}

/**
 * Emite evento de respaldo realizado
 * @param rutaOriginal Ruta del archivo original
 * @param rutaRespaldo Ruta del archivo de respaldo
 */
function emitirEventoBackupRealizado(rutaOriginal: string, rutaRespaldo: string): void {
  eventBus.emit('almacenamiento:backupRealizado', {
    rutaOriginal: path.basename(rutaOriginal),
    rutaRespaldo: path.basename(rutaRespaldo),
    timestamp: new Date().toISOString()
  });
}

/**
 * Emite evento de error
 * @param mensaje Mensaje descriptivo del error
 * @param error Objeto de error original
 */
function emitirEventoError(mensaje: string, error: unknown): void {
  const errorObj = {
    mensaje,
    error: String(error),
    timestamp: new Date().toISOString(),
    componente: 'gestorArchivos'
  };
  
  eventBus.emit('almacenamiento:error', errorObj);
  eventBus.emit('core:errorDetectado', errorObj);
}

// Exportar todas las funciones públicas
export default {
  leerArchivo,
  guardarArchivo,
  leerJSON,
  guardarJSON,
  validarArchivo,
  eliminarArchivo,
  hacerBackup,
  existeArchivo,
  listarArchivos
};
