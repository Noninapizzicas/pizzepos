/**
 * PizzePOS - Módulo Almacenamiento
 * panelComplementosUI.ts
 * 
 * Capa de presentación del panel de complementos.
 * Se encarga del renderizado y la interacción con el DOM.
 */

import { 
  EstadoPanelComplementos, 
  EstilosJSON,
  PanelComplementos
} from './panelComplementos';

/**
 * Clase para manejar la interfaz de usuario del panel de complementos
 */
export class PanelComplementosUI {
  private elementoRaiz: HTMLElement | null = null;
  private panel: PanelComplementos;
  
  /**
   * Constructor de la UI del panel
   * @param elementoContenedor - Elemento o ID donde se montará la UI
   * @param panel - Instancia del controlador del panel
   */
  constructor(elementoContenedor: string | HTMLElement, panel: PanelComplementos) {
    this.panel = panel;
    
    // Determinar el elemento raíz
    if (typeof elementoContenedor === 'string') {
      this.elementoRaiz = document.getElementById(elementoContenedor);
    } else {
      this.elementoRaiz = elementoContenedor;
    }

    if (!this.elementoRaiz) {
      console.error('No se pudo encontrar el elemento contenedor para el Panel de Complementos');
    }
  }
  
  /**
   * Inicializa la UI del panel
   * @param estilos - Estilos a aplicar
   */
  inicializar(estilos: EstilosJSON | null): void {
    if (estilos) {
      this.aplicarEstilosGlobales(estilos);
    }
  }
  
  /**
   * Aplica los estilos globales al documento
   * @param estilos - Estilos a aplicar
   */
  private aplicarEstilosGlobales(estilos: EstilosJSON): void {
    // Crear elemento de estilo
    const estilosElement = document.createElement('style');
    estilosElement.textContent = `
      .panel-complementos {
        font-family: ${estilos.tipografia.fuente};
        font-size: ${estilos.tipografia.tamanioBase};
        color: ${estilos.colores.texto};
        background-color: ${estilos.colores.fondo};
        padding: ${estilos.espaciado.normal};
      }
      
      .panel-complementos h1, .panel-complementos h2, .panel-complementos h3 {
        font-family: ${estilos.tipografia.titulos};
        margin-bottom: ${estilos.espaciado.normal};
      }
      
      .panel-complementos-header {
        display: flex;
        align-items: center;
        margin-bottom: ${estilos.espaciado.grande};
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: ${estilos.espaciado.normal};
      }
      
      .panel-complementos-titulo {
        font-size: 1.8rem;
        font-weight: 600;
        color: ${estilos.colores.primario};
      }
      
      .panel-complementos-contenido {
        display: grid;
        grid-template-columns: 250px 1fr;
        gap: ${estilos.espaciado.normal};
      }
      
      .panel-complementos-lista {
        background-color: white;
        border-radius: ${estilos.bordes.radio};
        box-shadow: ${estilos.bordes.sombra};
        padding: ${estilos.espaciado.normal};
        max-height: 600px;
        overflow-y: auto;
      }
      
      .panel-complementos-detalle {
        background-color: white;
        border-radius: ${estilos.bordes.radio};
        box-shadow: ${estilos.bordes.sombra};
        padding: ${estilos.espaciado.normal};
      }
      
      .complemento-item {
        padding: ${estilos.espaciado.normal};
        margin-bottom: ${estilos.espaciado.pequenio};
        border-radius: ${estilos.bordes.radio};
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .complemento-item:hover {
        background-color: #f5f5f5;
      }
      
      .complemento-item.activo {
        background-color: ${estilos.colores.primario};
        color: white;
      }
      
      .complemento-item h3 {
        margin: 0 0 ${estilos.espaciado.pequenio} 0;
        font-size: 1.1rem;
      }
      
      .complemento-item p {
        margin: 0;
        font-size: 0.9rem;
        opacity: 0.8;
      }
      
      .panel-acciones {
        display: flex;
        gap: ${estilos.espaciado.normal};
        margin: ${estilos.espaciado.normal} 0;
      }
      
      .panel-btn {
        background-color: ${estilos.colores.primario};
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: ${estilos.bordes.radio};
        cursor: pointer;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      
      .panel-btn:hover {
        background-color: #c62828;
      }
      
      .panel-btn:disabled {
        background-color: #bdbdbd;
        cursor: not-allowed;
      }
      
      .panel-btn-secundario {
        background-color: transparent;
        color: ${estilos.colores.primario};
        border: 1px solid ${estilos.colores.primario};
      }
      
      .panel-btn-secundario:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
      
      .zona-carga {
        border: 2px dashed #ccc;
        border-radius: ${estilos.bordes.radio};
        padding: ${estilos.espaciado.grande};
        text-align: center;
        margin: ${estilos.espaciado.normal} 0;
        transition: border-color 0.2s;
      }
      
      .zona-carga.arrastrando {
        border-color: ${estilos.colores.primario};
        background-color: rgba(0, 0, 0, 0.03);
      }
      
      .panel-mensaje {
        padding: ${estilos.espaciado.normal};
        border-radius: ${estilos.bordes.radio};
        margin: ${estilos.espaciado.normal} 0;
      }
      
      .panel-mensaje.exito {
        background-color: ${estilos.colores.exito};
        color: white;
      }
      
      .panel-mensaje.error {
        background-color: ${estilos.colores.error};
        color: white;
      }
      
      .panel-mensaje.info {
        background-color: ${estilos.colores.info};
        color: white;
      }
      
      .panel-mensaje.advertencia {
        background-color: ${estilos.colores.advertencia};
        color: white;
      }
      
      .vista-plantilla {
        background-color: #f8f8f8;
        border-radius: ${estilos.bordes.radio};
        padding: ${estilos.espaciado.normal};
        margin-top: ${estilos.espaciado.normal};
        max-height: 400px;
        overflow-y: auto;
        font-family: monospace;
        white-space: pre-wrap;
      }
      
      .errores-validacion {
        color: ${estilos.colores.error};
        margin: ${estilos.espaciado.normal} 0;
      }
      
      .errores-validacion ul {
        padding-left: ${estilos.espaciado.grande};
        margin: ${estilos.espaciado.pequenio} 0;
      }
      
      .cargador {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: girar 1s infinite linear;
      }
      
      @keyframes girar {
        to { transform: rotate(360deg); }
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .panel-complementos-contenido {
          grid-template-columns: 1fr;
        }
        
        .panel-complementos-lista {
          margin-bottom: ${estilos.espaciado.normal};
        }
      }
    `;
    
    // Añadir al head
    document.head.appendChild(estilosElement);
  }
  
  /**
   * Renderiza la interfaz de usuario completa
   * @param estado - Estado actual del panel
   */
  renderizarUI(estado: EstadoPanelComplementos): void {
    if (!this.elementoRaiz) return;
    
    // Limpiar elemento raíz
    this.elementoRaiz.innerHTML = '';
    
    // Crear estructura base
    const contenedor = document.createElement('div');
    contenedor.className = 'panel-complementos';
    
    // Cabecera
    const header = document.createElement('div');
    header.className = 'panel-complementos-header';
    
    const titulo = document.createElement('h1');
    titulo.className = 'panel-complementos-titulo';
    titulo.textContent = 'Panel de Complementos';
    
    header.appendChild(titulo);
    contenedor.appendChild(header);
    
    // Contenido principal
    const contenido = document.createElement('div');
    contenido.className = 'panel-complementos-contenido';
    
    // Lista de complementos
    const listaComplementos = document.createElement('div');
    listaComplementos.className = 'panel-complementos-lista';
    listaComplementos.id = 'panel-complementos-lista';
    
    const tituloLista = document.createElement('h2');
    tituloLista.textContent = 'Complementos disponibles';
    listaComplementos.appendChild(tituloLista);
    
    // Renderizar complementos
    if (estado.complementos.length === 0) {
      const noComplementos = document.createElement('p');
      noComplementos.textContent = 'No hay complementos disponibles';
      listaComplementos.appendChild(noComplementos);
    } else {
      estado.complementos.forEach(complemento => {
        const item = document.createElement('div');
        item.className = 'complemento-item';
        item.dataset.tipo = complemento.tipo;
        
        if (estado.complementoActivo === complemento.tipo) {
          item.classList.add('activo');
        }
        
        const nombreComplemento = document.createElement('h3');
        nombreComplemento.textContent = this.panel.formatearTitulo(complemento.tipo);
        
        const descripcionComplemento = document.createElement('p');
        descripcionComplemento.textContent = complemento.descripcion;
        
        item.appendChild(nombreComplemento);
        item.appendChild(descripcionComplemento);
        
        // Event listener para seleccionar complemento
        item.addEventListener('click', () => {
          this.panel.seleccionarComplemento(complemento.tipo);
        });
        
        listaComplementos.appendChild(item);
      });
    }
    
    // Panel de detalle
    const panelDetalle = document.createElement('div');
    panelDetalle.className = 'panel-complementos-detalle';
    panelDetalle.id = 'panel-complementos-detalle';
    
    // Si hay un complemento activo, mostrar sus detalles
    if (estado.complementoActivo) {
      this.renderizarDetalleComplemento(panelDetalle, estado);
    } else {
      const mensajeSeleccion = document.createElement('p');
      mensajeSeleccion.textContent = 'Selecciona un complemento para ver sus detalles';
      panelDetalle.appendChild(mensajeSeleccion);
    }
    
    // Área de mensajes
    const areaMensajes = document.createElement('div');
    areaMensajes.className = 'panel-mensajes';
    areaMensajes.id = 'panel-mensajes';
    
    if (estado.mensajeEstado && estado.tipoMensaje) {
      const mensaje = document.createElement('div');
      mensaje.className = `panel-mensaje ${estado.tipoMensaje}`;
      mensaje.textContent = estado.mensajeEstado;
      areaMensajes.appendChild(mensaje);
    }
    
    // Añadir elementos al DOM
    contenido.appendChild(listaComplementos);
    contenido.appendChild(panelDetalle);
    contenedor.appendChild(contenido);
    contenedor.appendChild(areaMensajes);
    
    this.elementoRaiz.appendChild(contenedor);
  }
  
  /**
   * Renderiza el detalle de un complemento seleccionado
   * @param elemento - Elemento donde renderizar el detalle
   * @param estado - Estado actual del panel
   */
  private renderizarDetalleComplemento(elemento: HTMLElement, estado: EstadoPanelComplementos): void {
    const complemento = estado.complementos.find(c => c.tipo === estado.complementoActivo);
    
    if (!complemento) return;
    
    elemento.innerHTML = '';
    
    // Título y descripción
    const titulo = document.createElement('h2');
    titulo.textContent = this.panel.formatearTitulo(complemento.tipo);
    
    const descripcion = document.createElement('p');
    descripcion.textContent = complemento.descripcion;
    
    // Panel de acciones
    const panelAcciones = document.createElement('div');
    panelAcciones.className = 'panel-acciones';
    
    // Botón para ver plantilla
    const btnVerPlantilla = document.createElement('button');
    btnVerPlantilla.className = 'panel-btn panel-btn-secundario';
    btnVerPlantilla.textContent = 'Ver plantilla';
    btnVerPlantilla.addEventListener('click', () => this.panel.verPlantilla(complemento.tipo));
    
    // Botón para cargar archivo existente
    const btnDescargar = document.createElement('button');
    btnDescargar.className = 'panel-btn panel-btn-secundario';
    btnDescargar.textContent = 'Descargar actual';
    btnDescargar.addEventListener('click', () => this.panel.descargarArchivo(complemento.tipo));
    
    panelAcciones.appendChild(btnVerPlantilla);
    panelAcciones.appendChild(btnDescargar);
    
    // Zona de carga de archivos
    const zonaCarga = document.createElement('div');
    zonaCarga.className = 'zona-carga';
    zonaCarga.id = 'zona-carga';
    zonaCarga.innerHTML = `
      <p>Arrastra un archivo JSON aquí o haz clic para seleccionarlo</p>
      <input type="file" id="input-archivo" accept=".json" style="display: none;">
    `;
    
    // Configurar drag and drop
    zonaCarga.addEventListener('dragover', (e) => {
      e.preventDefault();
      zonaCarga.classList.add('arrastrando');
    });
    
    zonaCarga.addEventListener('dragleave', () => {
      zonaCarga.classList.remove('arrastrando');
    });
    
    zonaCarga.addEventListener('drop', (e) => {
      e.preventDefault();
      zonaCarga.classList.remove('arrastrando');
      
      if (e.dataTransfer?.files.length) {
        this.panel.manejarArchivoSeleccionado(e.dataTransfer.files[0]);
      }
    });
    
    zonaCarga.addEventListener('click', () => {
      const inputArchivo = document.getElementById('input-archivo') as HTMLInputElement;
      if (inputArchivo) {
        inputArchivo.click();
      }
    });
    
    // Botón para validar y guardar
    const panelGuardado = document.createElement('div');
    panelGuardado.className = 'panel-acciones';
    
    const btnValidarGuardar = document.createElement('button');
    btnValidarGuardar.className = 'panel-btn';
    btnValidarGuardar.textContent = 'Validar y guardar';
    btnValidarGuardar.disabled = !estado.archivoSubido;
    btnValidarGuardar.addEventListener('click', () => this.panel.validarYGuardar());
    
    if (estado.cargando) {
      const cargador = document.createElement('span');
      cargador.className = 'cargador';
      btnValidarGuardar.textContent = 'Procesando... ';
      btnValidarGuardar.appendChild(cargador);
      btnValidarGuardar.disabled = true;
    }
    
    panelGuardado.appendChild(btnValidarGuardar);
    
    // Área de errores de validación
    const areaErrores = document.createElement('div');
    areaErrores.className = 'errores-validacion';
    areaErrores.id = 'errores-validacion';
    
    if (estado.erroresValidacion.length > 0) {
      const tituloErrores = document.createElement('h3');
      tituloErrores.textContent = 'Errores de validación:';
      
      const listaErrores = document.createElement('ul');
      estado.erroresValidacion.forEach(error => {
        const itemError = document.createElement('li');
        itemError.textContent = error;
        listaErrores.appendChild(itemError);
      });
      
      areaErrores.appendChild(tituloErrores);
      areaErrores.appendChild(listaErrores);
    }
    
    // Vista de plantilla
    const vistaPlantilla = document.createElement('div');
    vistaPlantilla.id = 'vista-plantilla';
    
    if (estado.mostrandoPlantilla && estado.plantillaActual) {
      vistaPlantilla.className = 'vista-plantilla';
      vistaPlantilla.innerHTML = `<h3>Plantilla para ${this.panel.formatearTitulo(complemento.tipo)}</h3>`;
      
      const contenidoPlantilla = document.createElement('pre');
      contenidoPlantilla.textContent = JSON.stringify(estado.plantillaActual, null, 2);
      
      vistaPlantilla.appendChild(contenidoPlantilla);
    }
    
    // Añadir elementos al detalle
    elemento.appendChild(titulo);
    elemento.appendChild(descripcion);
    elemento.appendChild(panelAcciones);
    elemento.appendChild(zonaCarga);
    elemento.appendChild(panelGuardado);
    elemento.appendChild(areaErrores);
    elemento.appendChild(vistaPlantilla);
    
    // Configurar evento de cambio en input de archivo
    setTimeout(() => {
      const inputArchivo = document.getElementById('input-archivo') as HTMLInputElement;
      if (inputArchivo) {
        inputArchivo.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files.length > 0) {
            this.panel.manejarArchivoSeleccionado(target.files[0]);
          }
        });
      }
    }, 0);
  }
}

export default PanelComplementosUI;
