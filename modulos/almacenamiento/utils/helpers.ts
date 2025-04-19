/**
 * helpers.ts
 * 
 * Funciones utilitarias comunes relacionadas con la manipulación de archivos JSON,
 * rutas de almacenamiento, verificación de existencia, y generación de nombres únicos.
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { EventEmitter } from 'events';

// EventBus global o local según la configuración del sistema
const eventBus = global.eventBus || new EventEmitter();

// Directorio base para archivos de datos
const DIRECTORIO_BASE = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), 'datos', 'almacenamiento')
  : path.join(process.cwd(), 'src', 'datos', 'almacenamiento');

/**
 * Genera un nombre de archivo seguro con fecha y hora para backups o copias temporales
 * @param nombreBase Nombre base del archivo
 * @param extension Extensión del archivo (por defecto .json)
 * @returns Nombre único que incluye nombreBase, timestamp y hash
 */
export function generarNombreArchivoSeguro(nombreBase: string, extension: string = '.json'): string {
  // Eliminar extensión si está presente en nombreBase
  const nombre = nombreBase.endsWith(extension)
    ? nombreBase.slice(0, -extension.length)
    : nombreBase;
  
  // Obtener timestamp actual en formato compacto
  const timestamp = new Date().toISOString()
    .replace(/:/g, '')
    .replace(/\./g, '')
    .replace(/-/g, '')
    .replace(/T/g, 'T')
    .replace(/Z/g, '');
  
  // Generar un hash corto para unicidad
  const hash = crypto.randomBytes(2).toString('hex');
  
  // Componer nombre final
  return `${nombre}_${timestamp}_${hash}${extension}`;
}

/**
 * Chequea si una ruta existe sin lanzar error si no existe
 * @param ruta Ruta a verificar (relativa o absoluta)
 * @returns Promise<boolean> indicando si la ruta existe
 */
export async function verificarExisteRuta(ruta: string): Promise<boolean> {
  try {
    // Resolver ruta completa si es relativa
    const rutaCompleta = esRutaAbsoluta(ruta) ? ruta : path.join(DIRECTORIO_BASE, ruta);
    
    // Verificar acceso
    await fs.access(rutaCompleta);
    return true;
  } catch {
    return false;
  }
}

/**
 * Asegura que una carpeta exista antes de guardar archivos
 * @param ruta Ruta del directorio a crear
 * @returns Promise<void>
 */
export async function crearDirectorioSiNoExiste(ruta: string): Promise<void> {
  try {
    // Resolver ruta completa si es relativa
    const rutaCompleta = esRutaAbsoluta(ruta) ? ruta : path.join(DIRECTORIO_BASE, ruta);
    
    // Verificar si existe
    const existe = await verificarExisteRuta(rutaCompleta);
    
    if (!existe) {
      // Crear directorio de forma recursiva
      await fs.mkdir(rutaCompleta, { recursive: true });
      
      // Emitir evento de directorio creado
      emitirEventoDirectorioCreado(rutaCompleta);
    }
  } catch (error) {
    console.error(`Error al crear directorio ${ruta}:`, error);
    emitirError(`Error al crear directorio ${ruta}`, error);
    throw error;
  }
}

/**
 * Carga un archivo JSON si existe y lo parsea
 * @param ruta Ruta al archivo JSON (relativa o absoluta)
 * @param valorDefecto Valor por defecto si el archivo no existe
 * @returns Promise con el objeto parseado o valorDefecto si no existe
 */
export async function leerJSONSeguro<T>(ruta: string, valorDefecto: T): Promise<T> {
  try {
    // Resolver ruta completa si es relativa
    const rutaCompleta = esRutaAbsoluta(ruta) ? ruta : path.join(DIRECTORIO_BASE, ruta);
    
    // Verificar si existe
    const existe = await verificarExisteRuta(rutaCompleta);
    
    if (!existe) {
      return valorDefecto;
    }
    
    // Leer y parsear archivo
    const contenido = await fs.readFile(rutaCompleta, 'utf8');
    return JSON.parse(contenido) as T;
  } catch (error) {
    console.error(`Error al leer JSON desde ${ruta}:`, error);
    emitirError(`Error al leer JSON desde ${ruta}`, error);
    
    // Si hay error al leer o parsear, devolver valor por defecto
    return valorDefecto;
  }
}

/**
 * Guarda un objeto como JSON, asegurando estructura válida
 * @param ruta Ruta donde guardar el archivo (relativa o absoluta)
 * @param datos Objeto a serializar y guardar
 * @param formatear Si es true, formatea el JSON con indentación (default: true)
 * @returns Promise<boolean> indicando éxito o fallo
 */
export async function guardarJSONSeguro<T>(ruta: string, datos: T, formatear: boolean = true): Promise<boolean> {
  try {
    // Resolver ruta completa si es relativa
    const rutaCompleta = esRutaAbsoluta(ruta) ? ruta : path.join(DIRECTORIO_BASE, ruta);
    
    // Asegurar que el directorio existe
    await crearDirectorioSiNoExiste(path.dirname(rutaCompleta));
    
    // Serializar objeto a JSON
    const contenido = formatear 
      ? JSON.stringify(datos, null, 2) 
      : JSON.stringify(datos);
    
    // Guardar archivo
    await fs.writeFile(rutaCompleta, contenido, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error al guardar JSON en ${ruta}:`, error);
    emitirError(`Error al guardar JSON en ${ruta}`, error);
    return false;
  }
}

/**
 * Calcula el hash SHA-256 de una cadena
 * @param contenido Contenido a hashear
 * @returns String con el hash en formato hexadecimal
 */
export function calcularHash(contenido: string): string {
  return crypto.createHash('sha256').update(contenido).digest('hex');
}

/**
 * Genera un identificador único universal (UUID)
 * @returns String con el UUID generado
 */
export function generarUUID(): string {
  return crypto.randomUUID();
}

/**
 * Verifica si dos objetos JSON son idénticos
 * @param obj1 Primer objeto
 * @param obj2 Segundo objeto
 * @returns boolean indicando si son idénticos
 */
export function sonObjetosIdenticos<T>(obj1: T, obj2: T): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * Obtiene la extensión de un archivo (con el punto)
 * @param nombreArchivo Nombre del archivo
 * @returns String con la extensión (ej: ".json")
 */
export function obtenerExtension(nombreArchivo: string): string {
  return path.extname(nombreArchivo);
}

/**
 * Obtiene el nombre base de un archivo sin extensión
 * @param nombreArchivo Nombre del archivo
 * @returns String con el nombre base
 */
export function obtenerNombreBase(nombreArchivo: string): string {
  return path.basename(nombreArchivo, path.extname(nombreArchivo));
}

/**
 * Valida que un objeto tenga las propiedades requeridas
 * @param objeto Objeto a validar
 * @param propiedadesRequeridas Array de nombres de propiedades requeridas
 * @returns boolean indicando si el objeto es válido
 */
export function tieneEstructuraMinima(objeto: any, propiedadesRequeridas: string[]): boolean {
  if (!objeto || typeof objeto !== 'object') {
    return false;
  }
  
  return propiedadesRequeridas.every(prop => prop in objeto);
}

/**
 * Formatea un tamaño en bytes a una representación legible
 * @param bytes Tamaño en bytes
 * @returns String formateado (ej: "1.5 KB", "2.3 MB")
 */
export function formatearTamano(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
}

/**
 * Verifica si una ruta es absoluta
 * @param ruta Ruta a verificar
 * @returns boolean indicando si es absoluta
 */
export function esRutaAbsoluta(ruta: string): boolean {
  return path.isAbsolute(ruta);
}

/**
 * Resuelve una ruta relativa al directorio base
 * @param ruta Ruta relativa
 * @returns Ruta absoluta
 */
export function resolverRuta(ruta: string): string {
  return esRutaAbsoluta(ruta) ? ruta : path.join(DIRECTORIO_BASE, ruta);
}

/**
 * Emite un evento de error
 * @param mensaje Mensaje descriptivo del error
 * @param error Objeto de error original
 */
export function emitirError(mensaje: string, error: unknown): void {
  const errorObj = {
    mensaje,
    error: String(error),
    timestamp: new Date().toISOString(),
    componente: 'helpers',
    modulo: 'almacenamiento'
  };
  
  eventBus.emit('almacenamiento:error', errorObj);
  eventBus.emit('core:errorDetectado', errorObj);
}

/**
 * Emite un evento de directorio creado
 * @param ruta Ruta del directorio creado
 */
function emitirEventoDirectorioCreado(ruta: string): void {
  eventBus.emit('almacenamiento:directorioCreado', {
    ruta: path.relative(DIRECTORIO_BASE, ruta),
    timestamp: new Date().toISOString()
  });
}

/**
 * Obtiene la fecha y hora actual en formato ISO
 * @returns String con la fecha y hora actual
 */
export function obtenerFechaHoraActual(): string {
  return new Date().toISOString();
}

/**
 * Añade metadatos a un objeto para seguimiento
 * @param objeto Objeto a modificar
 * @param metadatos Metadatos a añadir
 * @returns Objeto con metadatos añadidos
 */
export function agregarMetadatos<T>(objeto: T, metadatos: Record<string, any> = {}): T & { _metadatos: Record<string, any> } {
  return {
    ...objeto,
    _metadatos: {
      fechaModificacion: obtenerFechaHoraActual(),
      ...metadatos
    }
  };
}

// Exportar constante del directorio base
export { DIRECTORIO_BASE };
