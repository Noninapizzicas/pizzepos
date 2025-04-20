/**
 * PizzePOS - Módulo Almacenamiento
 * cargador.ts
 * 
 * Sistema de carga y detección de complementos para el módulo de almacenamiento.
 * Detecta automáticamente qué complementos están disponibles y proporciona
 * una interfaz común para interactuar con ellos.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { eventBus } from '../core/eventBus';
import { 
  verificarExisteRuta, 
  leerJSONSeguro, 
  guardarJSONSeguro, 
  emitirError,
  resolverRutaAlmacenamiento
} from './utils/helpers';

// Definición del esquema para complementos usando Zod
const esquemaComplemento = z.object({
  tipo: z.string(),
  descripcion: z.string(),
  estructuraEsperada: z.string(),
  destino: z.string(),
  persistente: z.boolean(),
  usaUI: z.boolean().optional().default(true)
});

// Tipo para un complemento basado en el esquema Zod
export type TipoComplemento = z.infer<typeof esquemaComplemento>;

// Tipo para un manejador de complemento
export type ManejadorComplemento = {
  validar: (datos: any) => Promise<{ valido: boolean; errores?: string[] }>;
  procesar: (datos: any) => Promise<any>;
  obtenerPlantilla: () => Promise<any>;
};

// Clase principal para gestionar los complementos
export class CargadorComplementos {
  private complementos: Map<string, TipoComplemento> = new Map();
  private manejadores: Map<string, ManejadorComplemento> = new Map();
  private rutaComplementos: string;
  private rutaPlantillas: string;
  private rutaDatos: string;

  constructor() {
    // Definir rutas base
    this.rutaComplementos = resolverRutaAlmacenamiento('complementos');
    this.rutaPlantillas = resolverRutaAlmacenamiento('plantillas');
    this.rutaDatos = resolverRutaAlmacenamiento('data');
  }

  /**
   * Inicializa el sistema de complementos
   */
  async inicializar(): Promise<void> {
    try {
      // Crear directorios necesarios si no existen
      await this.crearEstructuraDirectorios();
      
      // Detectar complementos disponibles
      await this.detectarComplementos();
      
      eventBus.emit('almacenamiento:complementosCargados', {
        cantidad: this.complementos.size,
        tipos: Array.from(this.complementos.keys()),
        timestamp: new Date().toISOString()
      });
      
      console.log(`[PizzePOS][Almacenamiento] ${this.complementos.size} complementos cargados`);
    } catch (error) {
      emitirError('Error al inicializar cargador de complementos', error);
    }
  }

  /**
   * Crea la estructura de directorios necesaria
   */
  private async crearEstructuraDirectorios(): Promise<void> {
    try {
      // Crear directorio de complementos si no existe
      if (!await verificarExisteRuta(this.rutaComplementos)) {
        await fs.mkdir(this.rutaComplementos, { recursive: true });
      }
      
      // Crear directorio de plantillas si no existe
      if (!await verificarExisteRuta(this.rutaPlantillas)) {
        await fs.mkdir(this.rutaPlantillas, { recursive: true });
      }
      
      // Crear directorio de datos si no existe
      if (!await verificarExisteRuta(this.rutaDatos)) {
        await fs.mkdir(this.rutaDatos, { recursive: true });
      }
    } catch (error) {
      emitirError('Error al crear estructura de directorios', error);
      throw error;
    }
  }

  /**
   * Detecta y carga los complementos disponibles
   */
  private async detectarComplementos(): Promise<void> {
    try {
      // Obtener archivos .ts en la carpeta de complementos
      const archivos = await fs.readdir(this.rutaComplementos);
      const archivosTS = archivos.filter(archivo => archivo.endsWith('.ts') || archivo.endsWith('.js'));

      // Cargar cada complemento
      for (const archivo of archivosTS) {
        const nombreBase = path.basename(archivo, path.extname(archivo));
        await this.cargarComplemento(nombreBase);
      }
    } catch (error) {
      emitirError('Error al detectar complementos', error);
    }
  }

  /**
   * Carga un complemento individual por su nombre
   * @param nombre - Nombre base del complemento
   */
  private async cargarComplemento(nombre: string): Promise<void> {
    try {
      // Ruta del archivo de metadatos
      const rutaMetadatos = path.join(this.rutaPlantillas, `${nombre}.meta.json`);
      
      // Verificar si existe el archivo de metadatos
      if (!await verificarExisteRuta(rutaMetadatos)) {
        console.warn(`[PizzePOS][Almacenamiento] No se encontró el archivo de metadatos para ${nombre}`);
        return;
      }
      
      // Cargar y validar metadatos del complemento
      const metadatos = await leerJSONSeguro<any>(rutaMetadatos, null);
      
      if (!metadatos) {
        console.warn(`[PizzePOS][Almacenamiento] Metadatos inválidos para ${nombre}`);
        return;
      }
      
      // Validar estructura con Zod
      try {
        const complementoValidado = esquemaComplemento.parse(metadatos);
        
        // Guardar complemento en el mapa
        this.complementos.set(nombre, complementoValidado);
        
        // Cargar manejador del complemento
        await this.cargarManejador(nombre);
        
        console.log(`[PizzePOS][Almacenamiento] Complemento cargado: ${nombre}`);
      } catch (error) {
        console.error(`[PizzePOS][Almacenamiento] Error en esquema de ${nombre}:`, error);
      }
    } catch (error) {
      emitirError(`Error al cargar complemento ${nombre}`, error);
    }
  }

  /**
   * Carga el manejador específico para un complemento
   * @param nombre - Nombre del complemento
   */
  private async cargarManejador(nombre: string): Promise<void> {
    try {
      // En un entorno real, aquí importaríamos dinámicamente el archivo .ts/.js
      // del complemento. Para simplificar, simularemos la carga con un manejador genérico.

      // Este es un punto donde la implementación real dependería del entorno de ejecución
      // y podría requerir ajustes específicos.

      // En Node.js moderno podríamos usar import dinámico:
      // const modulo = await import(path.join(this.rutaComplementos, `${nombre}.js`));
      
      // Para esta implementación, crearemos un manejador predeterminado:
      const complemento = this.complementos.get(nombre);
      
      if (!complemento) {
        return;
      }
      
      const manejador: ManejadorComplemento = {
        validar: async (datos: any) => {
          // En una implementación real, utilizaríamos el esquema específico
          // para validar. Aquí simulamos una validación básica.
          const plantilla = await this.obtenerPlantilla(nombre);
          
          if (!plantilla) {
            return { 
              valido: false, 
              errores: ['No se pudo cargar la plantilla para validación'] 
            };
          }
          
          // Validación simplificada
          const errores: string[] = [];
          
          // Comprobar si es un objeto
          if (!datos || typeof datos !== 'object') {
            errores.push('Los datos no son un objeto válido');
          }
          
          // Validar que los campos requeridos en la plantilla existan en los datos
          if (plantilla.camposRequeridos && Array.isArray(plantilla.camposRequeridos)) {
            for (const campo of plantilla.camposRequeridos) {
              if (!(campo in datos)) {
                errores.push(`Campo requerido faltante: ${campo}`);
              }
            }
          }
          
          return {
            valido: errores.length === 0,
            errores: errores.length > 0 ? errores : undefined
          };
        },
        
        procesar: async (datos: any) => {
          // Simulación de procesamiento
          const resultado = await this.validar(nombre, datos);
          
          if (!resultado.valido) {
            throw new Error(`Datos inválidos para ${nombre}: ${resultado.errores?.join(', ')}`);
          }
          
          // En un caso real, aquí procesaríamos los datos según la lógica específica
          // del complemento. Para esta implementación, simplemente los devolvemos.
          return datos;
        },
        
        obtenerPlantilla: async () => {
          return this.obtenerPlantilla(nombre);
        }
      };
      
      // Guardar el manejador en el mapa
      this.manejadores.set(nombre, manejador);
      
    } catch (error) {
      emitirError(`Error al cargar manejador para complemento ${nombre}`, error);
    }
  }

  /**
   * Obtiene la plantilla para un complemento
   * @param nombre - Nombre del complemento
   * @returns Plantilla JSON o null si no existe
   */
  private async obtenerPlantilla(nombre: string): Promise<any> {
    const complemento = this.complementos.get(nombre);
    
    if (!complemento) {
      return null;
    }
    
    // Cargar plantilla desde la ruta especificada en el complemento
    const rutaPlantilla = resolverRutaAlmacenamiento(complemento.estructuraEsperada);
    return await leerJSONSeguro(rutaPlantilla, null);
  }

  /**
   * Obtiene la lista de complementos disponibles
   * @returns Array de objetos de complemento
   */
  async obtenerComplementos(): Promise<TipoComplemento[]> {
    return Array.from(this.complementos.values());
  }

  /**
   * Verifica si un complemento está disponible
   * @param nombre - Nombre del complemento
   * @returns True si el complemento existe
   */
  tieneComplemento(nombre: string): boolean {
    return this.complementos.has(nombre);
  }

  /**
   * Obtiene un manejador para un complemento específico
   * @param nombre - Nombre del complemento
   * @returns Manejador o undefined si no existe
   */
  obtenerManejador(nombre: string): ManejadorComplemento | undefined {
    return this.manejadores.get(nombre);
  }

  /**
   * Valida datos contra la plantilla de un complemento
   * @param nombre - Nombre del complemento
   * @param datos - Datos a validar
   * @returns Resultado de la validación
   */
  async validar(nombre: string, datos: any): Promise<{ valido: boolean; errores?: string[] }> {
    const manejador = this.obtenerManejador(nombre);
    
    if (!manejador) {
      return { 
        valido: false, 
        errores: [`Complemento ${nombre} no encontrado`] 
      };
    }
    
    try {
      return await manejador.validar(datos);
    } catch (error) {
      emitirError(`Error al validar datos para ${nombre}`, error);
      return { 
        valido: false, 
        errores: [`Error interno al validar: ${String(error)}`] 
      };
    }
  }

  /**
   * Procesa datos para un complemento
   * @param nombre - Nombre del complemento
   * @param datos - Datos a procesar
   * @returns Datos procesados
   */
  async procesar(nombre: string, datos: any): Promise<any> {
    const manejador = this.obtenerManejador(nombre);
    
    if (!manejador) {
      throw new Error(`Complemento ${nombre} no encontrado`);
    }
    
    try {
      return await manejador.procesar(datos);
    } catch (error) {
      emitirError(`Error al procesar datos para ${nombre}`, error);
      throw error;
    }
  }

  /**
   * Guarda datos procesados en el destino correspondiente
   * @param nombre - Nombre del complemento
   * @param datos - Datos a guardar
   * @returns True si se guardó correctamente
   */
  async guardar(nombre: string, datos: any): Promise<boolean> {
    const complemento = this.complementos.get(nombre);
    
    if (!complemento) {
      return false;
    }
    
    try {
      // Validar datos antes de guardar
      const resultadoValidacion = await this.validar(nombre, datos);
      
      if (!resultadoValidacion.valido) {
        eventBus.emit('almacenamiento:archivoInvalido', {
          tipo: nombre,
          errores: resultadoValidacion.errores,
          timestamp: new Date().toISOString()
        });
        return false;
      }
      
      // Procesar datos si es necesario
      const datosProcesados = await this.procesar(nombre, datos);
      
      // Guardar en el destino especificado en el complemento
      const rutaDestino = resolverRutaAlmacenamiento(complemento.destino);
      await guardarJSONSeguro(rutaDestino, datosProcesados);
      
      // Emitir evento de archivo guardado
      eventBus.emit('almacenamiento:archivoPersistido', {
        tipo: nombre,
        ruta: complemento.destino,
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      emitirError(`Error al guardar datos para ${nombre}`, error);
      return false;
    }
  }

  /**
   * Carga datos desde el destino de un complemento
   * @param nombre - Nombre del complemento
   * @returns Datos cargados o null si no se pueden cargar
   */
  async cargar(nombre: string): Promise<any> {
    const complemento = this.complementos.get(nombre);
    
    if (!complemento) {
      return null;
    }
    
    try {
      const rutaDestino = resolverRutaAlmacenamiento(complemento.destino);
      const datos = await leerJSONSeguro(rutaDestino, null);
      
      if (datos) {
        eventBus.emit('almacenamiento:archivoCargado', {
          tipo: nombre,
          ruta: complemento.destino,
          timestamp: new Date().toISOString()
        });
      }
      
      return datos;
    } catch (error) {
      emitirError(`Error al cargar datos para ${nombre}`, error);
      return null;
    }
  }
}

// Instancia singleton para usar en toda la aplicación
export const cargadorComplementos = new CargadorComplementos();

// Exportar la instancia por defecto
export default cargadorComplementos;
