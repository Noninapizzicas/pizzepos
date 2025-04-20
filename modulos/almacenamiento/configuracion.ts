/**
 * PizzePOS - Módulo Almacenamiento
 * configuracion.ts
 * 
 * Configuración interna del módulo de almacenamiento. Centraliza opciones 
 * internas que controlan el comportamiento del sistema fuera de la visualización 
 * o del archivo global principal.
 */

export interface ConfigAlmacenamiento {
  habilitarBackups: boolean;
  maxRespaldosPorArchivo: number;
  rotacionRespaldosDias: number;
  sobrescribirSinConfirmar: boolean;
  tamanoMaxArchivoMB: number;
  modoSoloLectura: boolean;
  permitirComplementosTemporales: boolean;
  rutaBaseRelativa: string;
  formatearJSONAlGuardar: boolean;
  espaciadoIndentacion: number;
  cachearArchivos: boolean;
  tiempoExpiracionCacheMs: number;
  validacionEstricta: boolean;
  permitirPropiedadesExtras: boolean;
  logEventosEnConsola: boolean;
  maxIntentoReconexion: number;
}

export const configuracion: ConfigAlmacenamiento = {
  habilitarBackups: true,
  maxRespaldosPorArchivo: 10,
  rotacionRespaldosDias: 30,
  sobrescribirSinConfirmar: false,
  tamanoMaxArchivoMB: 5,
  modoSoloLectura: false,
  permitirComplementosTemporales: true,
  rutaBaseRelativa: 'datos/almacenamiento',
  formatearJSONAlGuardar: true,
  espaciadoIndentacion: 2,
  cachearArchivos: true,
  tiempoExpiracionCacheMs: 300000,
  validacionEstricta: true,
  permitirPropiedadesExtras: false,
  logEventosEnConsola: process.env.NODE_ENV !== 'production',
  maxIntentoReconexion: 3
};

export function getConfiguracion(): ConfigAlmacenamiento {
  return {...configuracion};
}

export function actualizarConfiguracion(nuevaConfig: Partial<ConfigAlmacenamiento>): void {
  if (configuracion.modoSoloLectura) {
    console.warn('No se puede actualizar la configuración en modo solo lectura');
    return;
  }
  Object.assign(configuracion, nuevaConfig);
  if (configuracion.logEventosEnConsola) {
    console.log('Configuración de almacenamiento actualizada', nuevaConfig);
  }
}

export function restablecerConfiguracion(): void {
  const configPredeterminada: ConfigAlmacenamiento = {
    habilitarBackups: true,
    maxRespaldosPorArchivo: 10,
    rotacionRespaldosDias: 30,
    sobrescribirSinConfirmar: false,
    tamanoMaxArchivoMB: 5,
    modoSoloLectura: false,
    permitirComplementosTemporales: true,
    rutaBaseRelativa: 'datos/almacenamiento',
    formatearJSONAlGuardar: true,
    espaciadoIndentacion: 2,
    cachearArchivos: true,
    tiempoExpiracionCacheMs: 300000,
    validacionEstricta: true,
    permitirPropiedadesExtras: false,
    logEventosEnConsola: process.env.NODE_ENV !== 'production',
    maxIntentoReconexion: 3
  };
  Object.assign(configuracion, configPredeterminada);
  if (configuracion.logEventosEnConsola) {
    console.log('Configuración de almacenamiento restablecida a valores predeterminados');
  }
}

export default configuracion;
