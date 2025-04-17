/**
 * config.ts
 * 
 * Maneja la carga inicial de configuración del microservidor desde un archivo plano
 * y expone métodos seguros para acceder a sus propiedades desde otros componentes del sistema.
 */

import { z } from 'zod';
import { promises as fs } from 'fs';
import { crearEventoBase } from '../utils/helpers';
import path from 'path';

// Esquema de validación para la configuración mínima requerida
const ConfigSchema = z.object({
  servidor: z.object({
    puerto: z.number().int().min(1).max(65535)
  }),
  version: z.string(),
  seguridad: z.object({
    permitirReconexiones: z.boolean().default(true),
    tiempoMaximoInactivo: z.number().int().min(0).default(3600000) // 1 hora en ms
  }).default({}),
  logs: z.object({
    nivel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    guardarEnArchivo: z.boolean().default(false)
  }).default({})
});

// Tipo derivado del esquema
export type ConfiguracionMicroservidor = z.infer<typeof ConfigSchema>;

// Valores por defecto para la configuración
const CONFIG_DEFAULT: ConfiguracionMicroservidor = {
  servidor: {
    puerto: 8080
  },
  version: '1.0.0',
  seguridad: {
    permitirReconexiones: true,
    tiempoMaximoInactivo: 3600000 // 1 hora en ms
  },
  logs: {
    nivel: 'info',
    guardarEnArchivo: false
  }
};

// Configuración cargada en memoria
let configuracion: ConfiguracionMicroservidor = { ...CONFIG_DEFAULT };

/**
 * Carga la configuración desde el archivo config.json
 * @returns Promesa que se resuelve cuando la configuración ha sido cargada
 */
export async function cargarConfig(): Promise<void> {
  try {
    // Ruta al archivo de configuración
    const rutaConfig = path.join(process.cwd(), 'config', 'config.json');
    
    // Leer el archivo
    const contenido = await fs.readFile(rutaConfig, 'utf8');
    
    // Parsear el JSON
    const datosConfig = JSON.parse(contenido);
    
    // Validar la estructura con Zod
    const resultado = ConfigSchema.safeParse(datosConfig);
    
    if (!resultado.success) {
      throw new Error(`Estructura de configuración inválida: ${resultado.error.message}`);
    }
    
    // Hacer merge con los valores por defecto
    configuracion = {
      ...CONFIG_DEFAULT,
      ...resultado.data
    };
    
    // Emitir evento de configuración cargada
    emitirEventoConfigCargada();
    
    console.log(`Configuración cargada correctamente. Puerto del servidor: ${configuracion.servidor.puerto}`);
    
  } catch (error) {
    // Si no se puede leer el archivo, usar los valores por defecto
    console.warn('No se pudo cargar el archivo de configuración. Usando valores por defecto.');
    configuracion = { ...CONFIG_DEFAULT };
    
    // Emitir evento de error
    emitirEventoError('Error al cargar configuración', error);
  }
}

/**
 * Obtiene la configuración completa
 * @returns Copia de la configuración actual
 */
export function getConfig(): ConfiguracionMicroservidor {
  return { ...configuracion };
}

/**
 * Obtiene un valor específico de la configuración
 * @param clave Clave a buscar en formato dot notation (ej: 'servidor.puerto')
 * @returns Valor encontrado o undefined si no existe
 */
export function getClaveConfig<T = any>(clave: string): T | undefined {
  const partes = clave.split('.');
  let actual: any = configuracion;
  
  for (const parte of partes) {
    if (actual === undefined || actual === null) {
      return undefined;
    }
    actual = actual[parte];
  }
  
  return actual as T;
}

/**
 * Valida si la configuración es válida para operar
 * @returns true si la configuración es válida, false si no
 */
export function validarConfiguracion(): boolean {
  try {
    // Validar la configuración actual contra el esquema
    ConfigSchema.parse(configuracion);
    return true;
  } catch (error) {
    emitirEventoError('Configuración inválida', error);
    return false;
  }
}

/**
 * Emite un evento informando que la configuración ha sido cargada
 */
function emitirEventoConfigCargada(): void {
  const evento = crearEventoBase('microservidor:configCargada', {
    puerto: configuracion.servidor.puerto,
    version: configuracion.version,
    timestamp: new Date().toISOString()
  });
  
  if (global.eventBus) {
    global.eventBus.emit('microservidor:configCargada', evento);
  }
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
    componente: 'config',
    modulo: 'microservidor'
  });
  
  if (global.eventBus) {
    global.eventBus.emit('core:errorDetectado', evento);
  }
  
  console.error(`[ERROR CONFIG] ${mensaje}: ${errorStr}`);
}
