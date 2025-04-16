/**
 * config.ts
 * 
 * Accede y valida el archivo global de configuración pizzepos.config.json.
 * Valida estructura, guarda en memoria, permite acceso por clave, y emite eventos.
 * No modifica ni guarda la configuración, solo la lee y expone.
 */

import { z } from 'zod';
import { EventBus, crearEventoBase, obtenerPorPath } from '../utils/helpers';
import { almacenamiento } from '../../almacenamiento'; // Módulo externo para acceso a archivos

// Esquema de validación para la configuración mínima requerida
const ConfigMinima = z.object({
  nombre: z.string(),
  versionConfig: z.string(),
  inicializacion: z.record(z.any()).default({}),
  modulosDisponibles: z.record(z.any()).default({})
});

// Tipo derivado del esquema
type ConfiguracionSistema = z.infer<typeof ConfigMinima> & Record<string, any>;

// Configuración por defecto (se usa si falta algún campo en el archivo)
const DEFAULT_CONFIG: ConfiguracionSistema = {
  nombre: 'PizzePOS',
  versionConfig: '1.0.0',
  inicializacion: {
    puntoEntrada: 'http://localhost:3000',
    moduloInicial: 'cuentas',
    modoCarga: 'reactivo'
  },
  modulosDisponibles: {
    core: {
      descripcion: 'Centro de eventos, validación, sincronización y control de dispositivos.',
      tipo: 'sistema'
    }
  }
};

// Configuración cargada en memoria
let configuracionCargada: ConfiguracionSistema = { ...DEFAULT_CONFIG };

/**
 * Lee y valida el archivo de configuración. Guarda en memoria.
 */
export async function cargarConfig(): Promise<void> {
  try {
    // Ruta del archivo de configuración
    const rutaArchivo = '/config/pizzepos.config.json';
    
    // Obtener el contenido del archivo desde el módulo de almacenamiento
    const contenido = await almacenamiento.leerArchivo(rutaArchivo);
    
    if (!contenido) {
      throw new Error(`No se pudo leer el archivo de configuración: ${rutaArchivo}`);
    }
    
    // Parsear el JSON
    const datosConfig = JSON.parse(contenido);
    
    // Validar la estructura mínima con Zod
    const resultado = ConfigMinima.safeParse(datosConfig);
    
    if (!resultado.success) {
      throw new Error(`Estructura de configuración inválida: ${resultado.error.message}`);
    }
    
    // Hacer merge con la configuración por defecto
    configuracionCargada = {
      ...DEFAULT_CONFIG,
      ...datosConfig
    };
    
    // Emitir evento de configuración cargada
    emitirEventoConfigCargada();
    
  } catch (error) {
    // Emitir evento de error
    emitirEventoError('Error al cargar configuración', error);
    throw error; // Re-lanzar el error para que el llamador sepa que algo falló
  }
}

/**
 * Devuelve una copia de la configuración cargada
 * @returns Objeto de configuración completo
 */
export function getConfig(): ConfiguracionSistema {
  // Devolvemos una copia para evitar modificaciones externas
  return { ...configuracionCargada };
}

/**
 * Permite acceder a una clave específica del objeto config usando notación de punto
 * @param clave Ruta de acceso usando punto (ej: "rutas.configuracion.mapaRutas.productos")
 * @returns Valor en la ruta especificada o undefined si no existe
 */
export function getClaveConfig(clave: string): any {
  return obtenerPorPath(configuracionCargada, clave);
}

/**
 * Vuelve a leer el archivo desde disco y lo actualiza en memoria
 */
export async function recargarConfig(): Promise<void> {
  // Simplemente reutilizamos la función de carga
  await cargarConfig();
}

/**
 * Verifica si la configuración ya ha sido cargada
 * @returns true si la configuración ha sido cargada, false si no
 */
export function esConfigCargada(): boolean {
  // Verificamos si tenemos algo más que los valores por defecto
  return configuracionCargada.nombre !== DEFAULT_CONFIG.nombre || 
         configuracionCargada.versionConfig !== DEFAULT_CONFIG.versionConfig;
}

/**
 * Emite un evento informando que la configuración ha sido cargada
 */
function emitirEventoConfigCargada(): void {
  const evento = crearEventoBase('core:configCargada', {
    nombre: configuracionCargada.nombre,
    version: configuracionCargada.versionConfig,
    modulosDisponibles: Object.keys(configuracionCargada.modulosDisponibles),
    timestamp: new Date().toISOString()
  });
  
  EventBus.emit('core:configCargada', evento);
}

/**
 * Emite un evento de error
 * @param mensaje Mensaje descriptivo del error
 * @param error Objeto de error original
 */
function emitirEventoError(mensaje: string, error: unknown): void {
  const evento = crearEventoBase('core:errorDetectado', {
    mensaje,
    error: String(error),
    componente: 'config'
  }, 'corazon', 9);
  
  EventBus.emit('core:errorDetectado', evento);
}
