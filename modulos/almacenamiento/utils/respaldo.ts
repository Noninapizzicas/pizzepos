/**
 * respaldo.ts
 * 
 * Gestiona el sistema de respaldos automáticos para archivos JSON del sistema PizzePOS.
 * Crea, lista, restaura y elimina respaldos con marcas de tiempo.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

// EventBus global o local según la configuración del sistema
const eventBus = global.eventBus || new EventEmitter();

// Directorio base para respaldos
const DIRECTORIO_BASE = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), 'datos', 'almacenamiento', 'respaldo')
  : path.join(process.cwd(), 'src', 'datos', 'almacenamiento', 'respaldo');

/**
 * Crea un respaldo con marca de tiempo de un archivo
 * @param nombreArchivo Nombre del archivo original (debe incluir tipo, ej: "productos.json")
 * @param contenido Contenido a respaldar
 * @returns Promise<boolean> indicando éxito o fallo
 */
export async function crearRespaldo(nombreArchivo: string, contenido: string): Promise<boolean> {
  try {
    // Extraer tipo de archivo del nombre (asumimos formato tipo.json o ruta/tipo.json)
    const nombreBase = path.basename(nombreArchivo, path.extname(nombreArchivo));
    const tipo = nombreBase.split('_')[0]; // Si hay guion bajo, tomamos la primera parte
    
    // Crear directorio específico para este tipo si no existe
    const directorioTipo = path.join(DIRECTORIO_BASE, tipo);
    await crearDirectorioSiNoExiste(directorioTipo);
    
    // Generar marca de tiempo única en formato ISO sin caracteres especiales
    const timestamp = new Date().toISOString().replace(/:/g, '').replace(/\./g, '').replace(/-/g, '');
    const nombreRespaldo = `${nombreBase}_${timestamp}.bak.json`;
    
    // Ruta completa al archivo de respaldo
    const rutaRespaldo = path.join(directorioTipo, nombreRespaldo);
    
    // Guardar respaldo
    await fs.writeFile(rutaRespaldo, contenido, 'utf8');
    
    // Emitir evento de respaldo creado
    emitirEventoRespaldoCreado(nombreArchivo, rutaRespaldo);
    
    return true;
  } catch (error) {
    console.error(`Error al crear respaldo de ${nombreArchivo}:`, error);
    emitirEventoError(`Error al crear respaldo de ${nombreArchivo}`, error);
    return false;
  }
}

/**
 * Lista todos los respaldos disponibles para un tipo específico
 * @param tipo Tipo de archivo (ej: "productos", "cuentas")
 * @returns Array de nombres de archivo de respaldo ordenados por fecha (más reciente primero)
 */
export async function listarRespaldos(tipo: string): Promise<string[]> {
  try {
    const directorioTipo = path.join(DIRECTORIO_BASE, tipo);
    
    // Verificar si existe el directorio
    try {
      await fs.access(directorioTipo);
    } catch {
      // Si no existe el directorio, devolver array vacío
      return [];
    }
    
    // Listar archivos en el directorio
    const archivos = await fs.readdir(directorioTipo);
    
    // Filtrar por extensión .bak.json
    const respaldos = archivos.filter(archivo => archivo.endsWith('.bak.json'));
    
    // Ordenar por fecha de creación (más reciente primero)
    // El timestamp está codificado en el nombre del archivo
    respaldos.sort((a, b) => {
      // Extrae timestamp (asumiendo formato nombre_TIMESTAMP.bak.json)
      const timestampA = a.split('_')[1]?.split('.')[0] || '';
      const timestampB = b.split('_')[1]?.split('.')[0] || '';
      // Orden descendente (más reciente primero)
      return timestampB.localeCompare(timestampA);
    });
    
    return respaldos;
  } catch (error) {
    console.error(`Error al listar respaldos para ${tipo}:`, error);
    emitirEventoError(`Error al listar respaldos para ${tipo}`, error);
    return [];
  }
}

/**
 * Restaura un respaldo específico
 * @param ruta Ruta relativa al respaldo (ej: "productos/productos_20240417T1105.bak.json")
 * @returns Promise con el contenido del respaldo o null si hay error
 */
export async function restaurarRespaldo(ruta: string): Promise<string | null> {
  try {
    // Resolver ruta completa
    const rutaCompleta = path.join(DIRECTORIO_BASE, ruta);
    
    // Verificar que existe
    await fs.access(rutaCompleta);
    
    // Leer contenido
    const contenido = await fs.readFile(rutaCompleta, 'utf8');
    
    // Emitir evento de respaldo restaurado
    emitirEventoRespaldoRestaurado(ruta);
    
    return contenido;
  } catch (error) {
    console.error(`Error al restaurar respaldo ${ruta}:`, error);
    emitirEventoError(`Error al restaurar respaldo ${ruta}`, error);
    return null;
  }
}

/**
 * Elimina un archivo de respaldo
 * @param ruta Ruta relativa al respaldo (ej: "productos/productos_20240417T1105.bak.json")
 * @returns Promise<boolean> indicando éxito o fallo
 */
export async function eliminarRespaldo(ruta: string): Promise<boolean> {
  try {
    // Resolver ruta completa
    const rutaCompleta = path.join(DIRECTORIO_BASE, ruta);
    
    // Verificar que existe
    await fs.access(rutaCompleta);
    
    // Eliminar archivo
    await fs.unlink(rutaCompleta);
    
    // Emitir evento de respaldo eliminado
    emitirEventoRespaldoEliminado(ruta);
    
    return true;
  } catch (error) {
    console.error(`Error al eliminar respaldo ${ruta}:`, error);
    emitirEventoError(`Error al eliminar respaldo ${ruta}`, error);
    return false;
  }
}

/**
 * Obtiene información sobre un respaldo específico
 * @param ruta Ruta relativa al respaldo
 * @returns Objeto con información del respaldo o null si hay error
 */
export async function obtenerInfoRespaldo(ruta: string): Promise<{
  tipo: string;
  archivo: string;
  timestamp: string;
  tamaño: number;
} | null> {
  try {
    // Resolver ruta completa
    const rutaCompleta = path.join(DIRECTORIO_BASE, ruta);
    
    // Verificar que existe
    await fs.access(rutaCompleta);
    
    // Obtener información del archivo
    const stats = await fs.stat(rutaCompleta);
    
    // Parsear nombre para extraer información
    const partes = path.basename(rutaCompleta).split('_');
    const tipo = path.dirname(ruta);
    const nombreBase = partes[0];
    const timestampRaw = partes[1]?.split('.')[0] || '';
    
    // Formatear timestamp para lectura humana si es posible
    let timestamp = timestampRaw;
    try {
      // Intentar formatear si parece un timestamp ISO
      if (timestampRaw.length > 8) {
        // Insertar caracteres ISO para que sea parseada correctamente
        const isoString = `${timestampRaw.substring(0, 4)}-${timestampRaw.substring(4, 6)}-${timestampRaw.substring(6, 8)}T${timestampRaw.substring(8, 10)}:${timestampRaw.substring(10, 12)}:${timestampRaw.substring(12, 14)}Z`;
        timestamp = new Date(isoString).toLocaleString();
      }
    } catch {
      // Si falla el formateo, mantenemos el valor original
    }
    
    return {
      tipo,
      archivo: nombreBase,
      timestamp,
      tamaño: stats.size
    };
  } catch (error) {
    console.error(`Error al obtener información del respaldo ${ruta}:`, error);
    return null;
  }
}

/**
 * Limpia respaldos antiguos manteniendo solo una cantidad específica por tipo
 * @param tipo Tipo de archivo (ej: "productos", "cuentas")
 * @param mantener Número de respaldos recientes a mantener (default: 10)
 * @returns Promise<number> con la cantidad de respaldos eliminados
 */
export async function limpiarRespaldosAntiguos(tipo: string, mantener: number = 10): Promise<number> {
  try {
    // Obtener lista ordenada de respaldos (más recientes primero)
    const respaldos = await listarRespaldos(tipo);
    
    // Si hay menos de los que queremos mantener, no hacemos nada
    if (respaldos.length <= mantener) {
      return 0;
    }
    
    // Calcular cuántos debemos eliminar
    const aEliminar = respaldos.length - mantener;
    
    // Eliminar los más antiguos (están al final del array)
    const respaldosAEliminar = respaldos.slice(-aEliminar);
    
    // Eliminar cada uno
    let eliminados = 0;
    for (const respaldo of respaldosAEliminar) {
      const rutaRelativa = path.join(tipo, respaldo);
      const eliminado = await eliminarRespaldo(rutaRelativa);
      if (eliminado) {
        eliminados++;
      }
    }
    
    return eliminados;
  } catch (error) {
    console.error(`Error al limpiar respaldos antiguos para ${tipo}:`, error);
    emitirEventoError(`Error al limpiar respaldos antiguos para ${tipo}`, error);
    return 0;
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
 * Emite evento de respaldo creado
 * @param archivoOriginal Nombre del archivo original
 * @param rutaRespaldo Ruta al archivo de respaldo
 */
function emitirEventoRespaldoCreado(archivoOriginal: string, rutaRespaldo: string): void {
  eventBus.emit('almacenamiento:respaldoCreado', {
    archivoOriginal: path.basename(archivoOriginal),
    rutaRespaldo: path.relative(DIRECTORIO_BASE, rutaRespaldo),
    timestamp: new Date().toISOString()
  });
}

/**
 * Emite evento de respaldo restaurado
 * @param ruta Ruta al archivo de respaldo
 */
function emitirEventoRespaldoRestaurado(ruta: string): void {
  eventBus.emit('almacenamiento:respaldoRestaurado', {
    rutaRespaldo: ruta,
    timestamp: new Date().toISOString()
  });
}

/**
 * Emite evento de respaldo eliminado
 * @param ruta Ruta al archivo de respaldo
 */
function emitirEventoRespaldoEliminado(ruta: string): void {
  eventBus.emit('almacenamiento:respaldoEliminado', {
    rutaRespaldo: ruta,
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
    componente: 'respaldo'
  };
  
  eventBus.emit('almacenamiento:error', errorObj);
  eventBus.emit('core:errorDetectado', errorObj);
}

// Exportar funciones públicas
export default {
  crearRespaldo,
  listarRespaldos,
  restaurarRespaldo,
  eliminarRespaldo,
  obtenerInfoRespaldo,
  limpiarRespaldosAntiguos
};
