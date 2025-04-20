/**
 * PizzePOS - Módulo Almacenamiento
 * panelComplementos.ts
 * 
 * Implementación del panel de complementos: lógica de negocio.
 * Gestiona el estado y las operaciones con complementos.
 */

import { cargadorComplementos, TipoComplemento } from '../cargador';
import { eventBus } from '../../core/eventBus';
import { leerJSONSeguro } from '../utils/helpers';
import { PanelComplementosUI } from './panelComplementosUI';

// Interfaces
export interface EstilosJSON {
  colores: {
    primario: string;
    secundario: string;
    fondo: string;
    texto: string;
    exito: string;
    error: string;
    advertencia: string;
    info: string;
  };
  tipografia: {
    fuente: string;
    tamanioBase: string;
    titulos: string;
  };
  bordes: {
    radio: string;
    sombra: string;
  };
  espaciado: {
    unidad: string;
    pequenio: string;
    normal: string;
    grande: string;
  };
}

// Estado del panel
export interface EstadoPanelComplementos {
  complementos: TipoComplemento[];
  complementoActivo: string | null;
  archivoSubido: File | null;
  datosValidados: boolean;
  mensajeEstado: string;
  tipoMensaje: 'exito' | 'error' | 'info' | 'advertencia' | null;
  datosActuales: any;
  erroresValidacion: string[];
  cargando: boolean;
  mostrandoPlantilla: boolean;
  plantillaActual: any;
}

/**
 * Clase principal del Panel de Complementos
 */
export class PanelComplementos {
  private estilos: EstilosJSON | null = null;
  private estado: EstadoPanelComplementos = {
    complementos: [],
    complementoActivo: null,
    archivoSubido: null,
    datosValidados: false,
    mensajeEstado: '',
    tipoMensaje: null,
    datosActuales: null,
    erroresValidacion: [],
    cargando: false,
    mostrandoPlantilla: false,
    plantillaActual: null
  };
  private ui: PanelComplementosUI;

  /**
   * Constructor del Panel de Complementos
   * @param elementoContenedor - Elemento donde se montará el panel
   */
  constructor(elementoContenedor: string | HTMLElement) {
    // Crear UI
    this.ui = new PanelComplementosUI(elementoContenedor, this);
  }

  /**
   * Inicializa el panel de complementos
   */
  async inicializar(): Promise<void> {
    try {
      // Cargar estilos
      await this.cargarEstilos();
      
      // Inicializar el cargador de complementos
      await cargadorComplementos.inicializar();
      
      // Obtener complementos disponibles
      this.estado.complementos = await cargadorComplementos.obtenerComplementos();
      
      // Inicializar UI
      this.ui.inicializar(this.estilos);
      
      // Renderizar la interfaz de usuario
      this.ui.renderizarUI(this.estado);
      
      // Configurar event listeners
      this.configurarEventos();
      
      // Emitir evento de panel inicializado
      eventBus.emit('almacenamiento:panelInicializado', {
        cantidadComplementos: this.estado.complementos.length,
        timestamp: new Date().toISOString()
      });
      
      // Mostrar mensaje inicial
      this.mostrarMensaje('Panel de complementos inicializado correctamente', 'info');
    } catch (error) {
      console.error('Error al inicializar el panel de complementos:', error);
      this.mostrarMensaje('Error al inicializar el panel', 'error');
    }
  }

  /**
   * Carga los estilos visuales desde el archivo de configuración
   */
  private async cargarEstilos(): Promise<void> {
    try {
      // Cargar estilos desde archivo JSON
      this.estilos = await leerJSONSeguro<EstilosJSON>('config/estilos.json', null);
      
      if (!this.estilos) {
        // Si no se pueden cargar, usar estilos por defecto
        this.estilos = {
          colores: {
            primario: '#e53935',
            secundario: '#ffb74d',
            fondo: '#f5f5f5',
            texto: '#212121',
            exito: '#4caf50',
            error: '#f44336',
            advertencia: '#ff9800',
            info: '#2196f3'
          },
          tipografia: {
            fuente: "'Segoe UI', Tahoma, sans-serif",
            tamanioBase: '16px',
            titulos: "'Segoe UI', Tahoma, sans-serif"
          },
          bordes: {
            radio: '8px',
            sombra: '0 2px 4px rgba(0, 0, 0, 0.1)'
          },
          espaciado: {
            unidad: '8px',
            pequenio: '8px',
            normal: '16px',
            grande: '24px'
          }
        };
      }
    } catch (error) {
      console.error('Error al cargar estilos:', error);
    }
  }

  /**
   * Configura los eventos globales para el panel
   */
  private configurarEventos(): void {
    // Escuchar eventos de cambios en complementos
    eventBus.on('almacenamiento:complementosCargados', () => {
      this.actualizarListaComplementos();
    });
  }

  /**
   * Actualiza la lista de complementos
   */
  private async actualizarListaComplementos(): Promise<void> {
    this.estado.complementos = await cargadorComplementos.obtenerComplementos();
    this.ui.renderizarUI(this.estado);
  }

  /**
   * Selecciona un complemento para mostrar sus detalles
   * @param tipo - Tipo de complemento a seleccionar
   */
  async seleccionarComplemento(tipo: string): Promise<void> {
    this.estado.complementoActivo = tipo;
    this.estado.archivoSubido = null;
    this.estado.datosValidados = false;
    this.estado.erroresValidacion = [];
    this.estado.mostrandoPlantilla = false;
    this.estado.plantillaActual = null;
    
    // Intentar cargar datos existentes
    try {
      this.estado.datosActuales = await cargadorComplementos.cargar(tipo);
    } catch (error) {
      console.error(`Error al cargar datos para ${tipo}:`, error);
      this.estado.datosActuales = null;
    }
    
    this.ui.renderizarUI(this.estado);
  }

  /**
   * Maneja el archivo seleccionado por el usuario
   * @param archivo - Archivo seleccionado
   */
  manejarArchivoSeleccionado(archivo: File): void {
    // Validar que sea un archivo JSON
    if (!archivo.name.toLowerCase().endsWith('.json')) {
      this.mostrarMensaje('El archivo debe ser un archivo JSON (.json)', 'error');
      return;
    }
    
    this.estado.archivoSubido = archivo;
    this.estado.datosValidados = false;
    this.estado.erroresValidacion = [];
    
    // Actualizar UI
    this.ui.renderizarUI(this.estado);
    
    // Mostrar mensaje
    this.mostrarMensaje(`Archivo "${archivo.name}" seleccionado`, 'info');
    
    // Emitir evento
    eventBus.emit('almacenamiento:archivoSubido', {
      tipo: this.estado.complementoActivo,
      nombreArchivo: archivo.name,
      tamanio: archivo.size,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Valida y guarda el archivo subido
   */
  async validarYGuardar(): Promise<void> {
    if (!this.estado.archivoSubido || !this.estado.complementoActivo) {
      return;
    }
    
    this.estado.cargando = true;
    this.ui.renderizarUI(this.estado);
    
    try {
      // Leer el contenido del archivo
      const contenido = await this.leerArchivo(this.estado.archivoSubido);
      
      // Parsear JSON
      const datos = JSON.parse(contenido);
      
      // Validar contra la plantilla
      const resultadoValidacion = await cargadorComplementos.validar(
        this.estado.complementoActivo, 
        datos
      );
      
      // Emitir evento de validación
      eventBus.emit('almacenamiento:archivoValidado', {
        tipo: this.estado.complementoActivo,
        valido: resultadoValidacion.valido,
        errores: resultadoValidacion.errores,
        timestamp: new Date().toISOString()
      });
      
      if (resultadoValidacion.valido) {
        // Datos válidos, guardar
        this.estado.datosValidados = true;
        this.estado.erroresValidacion = [];
        
        // Guardar en el sistema
        const guardadoExitoso = await cargadorComplementos.guardar(
          this.estado.complementoActivo,
          datos
        );
        
        if (guardadoExitoso) {
          this.mostrarMensaje('Archivo guardado correctamente', 'exito');
          
          // Actualizar datos actuales
          this.estado.datosActuales = datos;
          
          // Emitir evento de archivo persistido
          eventBus.emit('almacenamiento:archivoPersistido', {
            tipo: this.estado.complementoActivo,
            timestamp: new Date().toISOString()
          });
        } else {
          this.mostrarMensaje('Error al guardar el archivo', 'error');
        }
      } else {
        // Datos inválidos, mostrar errores
        this.estado.datosValidados = false;
        this.estado.erroresValidacion = resultadoValidacion.errores || ['Error de validación desconocido'];
        
        this.mostrarMensaje('El archivo no cumple con la estructura esperada', 'error');
        
        // Emitir evento de archivo inválido
        eventBus.emit('almacenamiento:archivoInvalido', {
          tipo: this.estado.complementoActivo,
          errores: this.estado.erroresValidacion,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error al procesar archivo:', error);
      this.mostrarMensaje('Error al procesar el archivo: ' + String(error), 'error');
      
      // Emitir evento de error
      eventBus.emit('core:errorDetectado', {
        modulo: 'almacenamiento',
        componente: 'panelComplementos',
        mensaje: 'Error al procesar archivo',
        error: String(error),
        timestamp: new Date().toISOString()
      });
    } finally {
      this.estado.cargando = false;
      this.ui.renderizarUI(this.estado);
    }
  }

  /**
   * Muestra la plantilla para un complemento
   * @param tipo - Tipo de complemento
   */
  async verPlantilla(tipo: string): Promise<void> {
    try {
      // Obtener manejador del complemento
      const manejador = cargadorComplementos.obtenerManejador(tipo);
      
      if (!manejador) {
        this.mostrarMensaje(`No se encontró el manejador para ${tipo}`, 'error');
        return;
      }
      
      // Obtener plantilla
      const plantilla = await manejador.obtenerPlantilla();
      
      // Actualizar estado
      this.estado.mostrandoPlantilla = true;
      this.estado.plantillaActual = plantilla;
      
      // Renderizar UI
      this.ui.renderizarUI(this.estado);
    } catch (error) {
      console.error(`Error al obtener plantilla para ${tipo}:`, error);
      this.mostrarMensaje(`Error al obtener plantilla: ${String(error)}`, 'error');
    }
  }

  /**
   * Descarga el archivo actual para un complemento
   * @param tipo - Tipo de complemento
   */
  async descargarArchivo(tipo: string): Promise<void> {
    try {
      // Obtener datos actuales o cargarlos si no están en memoria
      let datos = this.estado.datosActuales;
      
      if (!datos) {
        datos = await cargadorComplementos.cargar(tipo);
      }
      
      if (!datos) {
        this.mostrarMensaje(`No existen datos guardados para ${this.formatearTitulo(tipo)}`, 'advertencia');
        return;
      }
      
      // Crear archivo para descargar
      const contenido = JSON.stringify(datos, null, 2);
      const blob = new Blob([contenido], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Crear link de descarga
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tipo}.json`;
      a.click();
      
      // Liberar URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      // Mostrar mensaje
      this.mostrarMensaje(`Archivo ${tipo}.json descargado`, 'exito');
    } catch (error) {
      console.error(`Error al descargar archivo para ${tipo}:`, error);
      this.mostrarMensaje(`Error al descargar archivo: ${String(error)}`, 'error');
    }
  }

  /**
   * Lee un archivo y devuelve su contenido como texto
   * @param archivo - Archivo a leer
   * @returns Promesa con el contenido del archivo
   */
  private leerArchivo(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Error al leer el archivo'));
        }
      };
      
      reader.onerror = () => {
        reject(reader.error);
      };
      
      reader.readAsText(archivo);
    });
  }

  /**
   * Formatea un título (primera letra mayúscula)
   * @param texto - Texto a formatear
   * @returns Texto formateado
   */
  formatearTitulo(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  /**
   * Muestra un mensaje en la interfaz
   * @param mensaje - Mensaje a mostrar
   * @param tipo - Tipo de mensaje
   */
  mostrarMensaje(mensaje: string, tipo: 'exito' | 'error' | 'info' | 'advertencia'): void {
    this.estado.mensajeEstado = mensaje;
    this.estado.tipoMensaje = tipo;
    
    // Actualizar UI
    this.ui.renderizarUI(this.estado);
    
    // Ocultar mensaje después de un tiempo
    setTimeout(() => {
      this.estado.mensajeEstado = '';
      this.estado.tipoMensaje = null;
      this.ui.renderizarUI(this.estado);
    }, 5000);
  }

  /**
   * Obtiene el estado actual del panel
   * @returns Estado actual
   */
  getEstado(): EstadoPanelComplementos {
    return this.estado;
  }

  /**
   * Obtiene los estilos cargados
   * @returns Estilos cargados
   */
  getEstilos(): EstilosJSON | null {
    return this.estilos;
  }
}

// Exportar la clase por defecto
export default PanelComplementos;
