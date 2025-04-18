/**
 * index.ts - Módulo Almacenamiento
 * 
 * Punto de entrada principal para el sistema de almacenamiento de PizzePOS.
 * Coordina la carga, validación y acceso a archivos de configuración y datos.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { EventEmitter } from 'events';

// Esquema de validación para un complemento de almacenamiento
const ComplementoSchema = z.object({
  tipo: z.string(),
  descripcion: z.string(),
  estructuraEsperada: z.string(),
  destino: z.string(),
  persistente: z.boolean().default(true),
  usaUI: z.boolean().default(true),
  version: z.string().optional()
});

// Tipo derivado del esquema
type Complemento = z.infer<typeof ComplementoSchema>;

// EventBus global o local según la configuración del sistema
const eventBus = global.eventBus || new EventEmitter();

// Rutas base para archivos y plantillas
const RUTA_BASE = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), 'datos', 'almacenamiento')
  : path.join(process.cwd(), 'src', 'datos', 'almacenamiento');

const RUTA_PLANTILLAS = path.join(RUTA_BASE, 'plantillas');
const RUTA_DATOS = path.join(RUTA_BASE, 'datos');
const RUTA_COMPLEMENTOS = path.join(RUTA_BASE, 'complementos');
const RUTA_RESPALDOS = path.join(RUTA_BASE, 'respaldos');

// Estado global del módulo
const estado = {
  complementos: new Map<string, Complemento>(),
  archivos: new Map<string, any>(),
  errores: new Map<string, string>(),
  inicializado: false
};

/**
 * Inicializa el sistema de almacenamiento
 * @returns Promesa que se resuelve cuando el sistema está listo
 */
export async function iniciarAlmacenamiento(): Promise<void> {
  if (estado.inicializado) {
    console.warn('El sistema de almacenamiento ya está inicializado');
    return;
  }

  try {
    console.log('Iniciando sistema de almacenamiento...');
    
    // Asegurar que existan los directorios necesarios
    await crearDirectoriosBase();
    
    // Cargar todos los complementos disponibles
    await cargarComplementos();
    
    // Cargar todos los archivos de datos
    await cargarTodosLosArchivos();
    
    // Marcar como inicializado
    estado.inicializado = true;
    
    // Emitir evento de sistema listo
    eventBus.emit('almacenamiento:listo', {
      complementosCargados: Array.from(estado.complementos.keys()),
      archivosCargados: Array.from(estado.archivos.keys())
    });
    
    console.log(`Sistema de almacenamiento iniciado con ${estado.complementos.size} complementos`);
    
  } catch (error) {
    console.error('Error al inicializar el sistema de almacenamiento:', error);
    emitirError('Error al inicializar', error);
    throw error;
  }
}

/**
 * Crea los directorios base si no existen
 */
async function crearDirectoriosBase(): Promise<void> {
  const directorios = [RUTA_DATOS, RUTA_PLANTILLAS, RUTA_COMPLEMENTOS, RUTA_RESPALDOS];
  
  for (const dir of directorios) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.warn(`No se pudo crear el directorio ${dir}:`, error);
    }
  }
}

/**
 * Carga todos los complementos disponibles
 */
async function cargarComplementos(): Promise<void> {
  try {
    // Leer todos los archivos JSON en el directorio de complementos
    const archivos = await fs.readdir(RUTA_COMPLEMENTOS);
    const archivosJSON = archivos.filter(archivo => archivo.endsWith('.json'));
    
    for (const archivo of archivosJSON) {
      try {
        const contenido = await fs.readFile(path.join(RUTA_COMPLEMENTOS, archivo), 'utf8');
        const datos = JSON.parse(contenido);
        
        // Validar estructura del complemento
        const resultado = ComplementoSchema.safeParse(datos);
        
        if (resultado.success) {
          estado.complementos.set(resultado.data.tipo, resultado.data);
          console.log(`Complemento cargado: ${resultado.data.tipo}`);
        } else {
          estado.errores.set(archivo, `Estructura inválida: ${resultado.error.message}`);
          console.error(`Error en complemento ${archivo}:`, resultado.error.message);
          emitirEventoErrorValidacion(archivo, resultado.error.message);
        }
      } catch (error) {
        estado.errores.set(archivo, `Error al procesar: ${String(error)}`);
        console.error(`Error al procesar complemento ${archivo}:`, error);
        emitirEventoErrorValidacion(archivo, String(error));
      }
    }
    
  } catch (error) {
    console.error('Error al cargar complementos:', error);
    emitirError('Error al cargar complementos', error);
  }
}

/**
 * Carga todos los archivos de datos según los complementos disponibles
 */
async function cargarTodosLosArchivos(): Promise<void> {
  for (const [tipo, complemento] of estado.complementos.entries()) {
    await cargarArchivo(tipo);
  }
}

/**
 * Carga un archivo específico según su tipo
 * @param tipo Tipo de archivo a cargar
 * @returns Promesa con los datos cargados o null si hubo error
 */
async function cargarArchivo(tipo: string): Promise<any> {
  const complemento = estado.complementos.get(tipo);
  
  if (!complemento) {
    console.error(`No existe complemento para el tipo ${tipo}`);
    return null;
  }
  
  try {
    // Ruta completa al archivo de datos
    const rutaArchivo = path.join(RUTA_DATOS, complemento.destino);
    
    // Verificar si existe el archivo
    try {
      await fs.access(rutaArchivo);
    } catch (error) {
      console.log(`Archivo ${tipo} no encontrado, se usará uno vacío`);
      estado.archivos.set(tipo, {});
      return {};
    }
    
    // Leer y parsear el archivo
    const contenido = await fs.readFile(rutaArchivo, 'utf8');
    const datos = JSON.parse(contenido);
    
    // Cargar la plantilla para validación
    const plantilla = await cargarPlantilla(complemento.estructuraEsperada);
    
    if (plantilla) {
      // Validar estructura según plantilla
      const esValido = validarContraPlantilla(datos, plantilla);
      
      if (esValido) {
        // Almacenar datos validados
        estado.archivos.set(tipo, datos);
        
        // Emitir evento de carga exitosa
        emitirEventoComplementoCargado(tipo, datos);
        
        return datos;
      } else {
        emitirEventoErrorValidacion(tipo, 'No cumple con la estructura esperada');
        console.error(`Archivo ${tipo} inválido según plantilla`);
        return null;
      }
    } else {
      // Si no hay plantilla, aceptamos cualquier estructura
      console.warn(`No se encontró plantilla para ${tipo}, se acepta sin validación`);
      estado.archivos.set(tipo, datos);
      emitirEventoComplementoCargado(tipo, datos);
      return datos;
    }
    
  } catch (error) {
    console.error(`Error al cargar archivo ${tipo}:`, error);
    emitirError(`Error al cargar ${tipo}`, error);
    return null;
  }
}

/**
 * Carga una plantilla para validación
 * @param rutaRelativa Ruta relativa a la plantilla
 * @returns Objeto plantilla o null si no existe
 */
async function cargarPlantilla(rutaRelativa: string): Promise<any> {
  try {
    const rutaCompleta = path.join(RUTA_PLANTILLAS, rutaRelativa);
    const contenido = await fs.readFile(rutaCompleta, 'utf8');
    return JSON.parse(contenido);
  } catch (error) {
    console.warn(`No se pudo cargar plantilla ${rutaRelativa}:`, error);
    return null;
  }
}

/**
 * Valida datos contra una plantilla
 * @param datos Datos a validar
 * @param plantilla Plantilla para validación
 * @returns true si es válido, false si no
 */
function validarContraPlantilla(datos: any, plantilla: any): boolean {
  // Implementación básica - en un sistema real usaríamos Zod o Ajv
  // Esta implementación simplificada solo verifica estructura superficial
  
  for (const key in plantilla) {
    if (!(key in datos)) {
      return false;
    }
    
    // Validación recursiva para objetos anidados
    if (typeof plantilla[key] === 'object' && plantilla[key] !== null && 
        typeof datos[key] === 'object' && datos[key] !== null) {
      if (!validarContraPlantilla(datos[key], plantilla[key])) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Guarda un archivo en su destino
 * @param tipo Tipo de archivo a guardar
 * @param datos Datos a guardar
 * @returns Promesa que se resuelve cuando se guarda el archivo
 */
export async function guardarArchivo(tipo: string, datos: any): Promise<boolean> {
  const complemento = estado.complementos.get(tipo);
  
  if (!complemento) {
    emitirError(`No existe complemento para el tipo ${tipo}`, new Error('Complemento no encontrado'));
    return false;
  }
  
  if (!complemento.persistente) {
    console.warn(`El complemento ${tipo} está marcado como no persistente`);
    estado.archivos.set(tipo, datos);
    emitirEventoComplementoCargado(tipo, datos);
    return true;
  }
  
  try {
    // Crear respaldo del archivo actual si existe
    await crearRespaldo(tipo);
    
    // Ruta completa al archivo de destino
    const rutaArchivo = path.join(RUTA_DATOS, complemento.destino);
    
    // Guardar el archivo
    await fs.writeFile(rutaArchivo, JSON.stringify(datos, null, 2), 'utf8');
    
    // Actualizar estado en memoria
    estado.archivos.set(tipo, datos);
    
    // Emitir evento de persistencia
    eventBus.emit('almacenamiento:archivoPersistido', {
      tipo,
      ruta: rutaArchivo,
      timestamp: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error(`Error al guardar archivo ${tipo}:`, error);
    emitirError(`Error al guardar ${tipo}`, error);
    return false;
  }
}

/**
 * Crea un respaldo de un archivo existente
 * @param tipo Tipo de archivo
 */
async function crearRespaldo(tipo: string): Promise<void> {
  const complemento = estado.complementos.get(tipo);
  
  if (!complemento) return;
  
  const rutaOriginal = path.join(RUTA_DATOS, complemento.destino);
  
  try {
    // Verificar si existe el archivo original
    await fs.access(rutaOriginal);
    
    // Crear nombre de archivo para respaldo
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const nombreRespaldo = `${tipo}_${timestamp}.json`;
    const rutaRespaldo = path.join(RUTA_RESPALDOS, nombreRespaldo);
    
    // Copiar el archivo
    await fs.copyFile(rutaOriginal, rutaRespaldo);
    
    console.log(`Respaldo creado: ${nombreRespaldo}`);
  } catch (error) {
    // Si el archivo no existe, no hacemos nada
    console.log(`No se creó respaldo de ${tipo}: archivo no existe`);
  }
}

/**
 * Elimina un archivo
 * @param tipo Tipo de archivo a eliminar
 * @returns Promesa que se resuelve cuando se elimina el archivo
 */
export async function eliminarArchivo(tipo: string): Promise<boolean> {
  const complemento = estado.complementos.get(tipo);
  
  if (!complemento) {
    emitirError(`No existe complemento para el tipo ${tipo}`, new Error('Complemento no encontrado'));
    return false;
  }
  
  try {
    // Crear respaldo antes de eliminar
    await crearRespaldo(tipo);
    
    // Ruta completa al archivo
    const rutaArchivo = path.join(RUTA_DATOS, complemento.destino);
    
    // Eliminar el archivo
    await fs.unlink(rutaArchivo);
    
    // Eliminar del estado en memoria
    estado.archivos.delete(tipo);
    
    // Emitir evento de eliminación
    eventBus.emit('almacenamiento:archivoEliminado', {
      tipo,
      timestamp: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error(`Error al eliminar archivo ${tipo}:`, error);
    emitirError(`Error al eliminar ${tipo}`, error);
    return false;
  }
}

/**
 * Obtiene los datos de un archivo cargado
 * @param tipo Tipo de archivo
 * @returns Datos del archivo o null si no existe
 */
export function getArchivo(tipo: string): any {
  return estado.archivos.get(tipo) || null;
}

/**
 * Obtiene todos los tipos de complementos disponibles
 * @returns Lista de tipos de complementos
 */
export function getComplementosDisponibles(): string[] {
  return Array.from(estado.complementos.keys());
}

/**
 * Obtiene información sobre un complemento específico
 * @param tipo Tipo de complemento
 * @returns Información del complemento o null si no existe
 */
export function getInfoComplemento(tipo: string): Complemento | null {
  return estado.complementos.get(tipo) || null;
}

/**
 * Verifica si un archivo está cargado
 * @param tipo Tipo de archivo
 * @returns true si está cargado, false si no
 */
export function tieneArchivoCargado(tipo: string): boolean {
  return estado.archivos.has(tipo);
}

/**
 * Emite evento de complemento cargado
 * @param tipo Tipo de complemento
 * @param datos Datos cargados
 */
function emitirEventoComplementoCargado(tipo: string, datos: any): void {
  eventBus.emit('almacenamiento:complementoCargado', {
    tipo,
    timestamp: new Date().toISOString(),
    tamaño: JSON.stringify(datos).length
  });
}

/**
 * Emite evento de error de validación
 * @param tipo Tipo de archivo con error
 * @param mensaje Mensaje de error
 */
function emitirEventoErrorValidacion(tipo: string, mensaje: string): void {
  eventBus.emit('almacenamiento:errorValidacion', {
    tipo,
    mensaje,
    timestamp: new Date().toISOString()
  });
}

/**
 * Emite evento de error general
 * @param mensaje Mensaje de error
 * @param error Objeto de error
 */
function emitirError(mensaje: string, error: unknown): void {
  const errorObj = {
    mensaje,
    error: String(error),
    timestamp: new Date().toISOString(),
    componente: 'almacenamiento'
  };
  
  eventBus.emit('almacenamiento:error', errorObj);
  eventBus.emit('core:errorDetectado', errorObj);
}

// Exportar funciones públicas
export default {
  iniciarAlmacenamiento,
  getArchivo,
  guardarArchivo,
  eliminarArchivo,
  getComplementosDisponibles,
  getInfoComplemento,
  tieneArchivoCargado
};
