# Módulo de Almacenamiento

Este módulo gestiona la carga, validación y persistencia de archivos JSON de configuración y datos del sistema PizzePOS.

## Estructura de directorios

- `datos/`: Archivos JSON con datos del sistema
- `plantillas/`: Plantillas para validación de estructura
- `complementos/`: Definiciones de tipos de archivos soportados
- `respaldos/`: Copias automáticas de archivos antes de modificarlos

## Uso básico

```typescript
import almacenamiento from './modulos/almacenamiento';

// Iniciar el sistema de almacenamiento
await almacenamiento.iniciarAlmacenamiento();

// Obtener datos de productos
const productos = almacenamiento.getArchivo('productos');

// Guardar cambios en productos
await almacenamiento.guardarArchivo('productos', productosModificados);
```

## Eventos emitidos

- `almacenamiento:complementoCargado`: Cuando se carga un archivo con éxito
- `almacenamiento:errorValidacion`: Si un archivo no cumple con su plantilla
- `almacenamiento:archivoPersistido`: Al guardar un archivo correctamente
- `almacenamiento:error`: Error general del sistema de almacenamiento

## Validación de archivos

El sistema incluye un validador robusto que verifica la estructura de los archivos JSON según plantillas predefinidas:

```typescript
import { validador } from './modulos/almacenamiento/validacion/validador';

// Validar un archivo JSON
const esValido = await validador.validarArchivo(contenidoJSON, 'productos');

// Validar datos ya parseados
const datosValidos = await validador.validarDatos(objetoProductos, 'productos');

// Generar una nueva plantilla basada en datos existentes
await validador.generarPlantilla(objetoProductos, 'nuevoTipo');
```

### Eventos de validación

El validador emite los siguientes eventos:
- `almacenamiento:validacionExitosa`: Cuando un archivo cumple con su plantilla
- `almacenamiento:validacionFallida`: Cuando se encuentran errores de estructura
- `almacenamiento:error`: Cuando ocurre un error crítico durante la validación

## Gestor de Archivos

El sistema incluye un gestor de archivos robusto que permite operaciones CRUD sobre archivos JSON:

```typescript
import gestorArchivos from './modulos/almacenamiento/utils/gestorArchivos';

// Leer un archivo
const contenido = await gestorArchivos.leerArchivo('config/config.json');

// Leer y parsear un archivo JSON
const datos = await gestorArchivos.leerJSON('datos/productos.json');

// Guardar un archivo JSON
await gestorArchivos.guardarJSON('datos/productos.json', objetoProductos);

// Crear un respaldo
await gestorArchivos.hacerBackup('datos/productos.json');

// Eliminar un archivo (con respaldo automático)
await gestorArchivos.eliminarArchivo('datos/productos.json');
```

### Características principales

- Rutas relativas o absolutas
- Respaldos automáticos antes de modificar archivos
- Emisión de eventos para todas las operaciones
- Validación integrada con Zod
- Manejo robusto de errores

## Sistema de Respaldos

El módulo incluye un sistema robusto de respaldos automáticos para archivos JSON:

```typescript
import respaldo from './modulos/almacenamiento/utils/respaldo';

// Crear un respaldo manualmente
await respaldo.crearRespaldo('productos.json', contenidoJSON);

// Listar respaldos disponibles
const respaldosProductos = await respaldo.listarRespaldos('productos');

// Restaurar un respaldo específico
const contenidoRestaurado = await respaldo.restaurarRespaldo('productos/productos_20240417T1105.bak.json');

// Obtener información de un respaldo
const info = await respaldo.obtenerInfoRespaldo('productos/productos_20240417T1105.bak.json');

// Limpiar respaldos antiguos (mantener solo los 5 más recientes)
await respaldo.limpiarRespaldosAntiguos('productos', 5);
```

### Características del sistema de respaldos

- Organización por tipo de archivo
- Marcas de tiempo únicas en formato ISO
- Nombrado automático con formato consistente
- Historial de respaldos con capacidad de restauración
- Limpieza automática de respaldos antiguos
- Emisión de eventos para seguimiento

## Utilidades (Helpers)

El módulo incluye un conjunto de funciones utilitarias para simplificar operaciones comunes:

```typescript
import { 
  generarNombreArchivoSeguro, 
  leerJSONSeguro, 
  guardarJSONSeguro, 
  calcularHash 
} from './modulos/almacenamiento/utils/helpers';

// Generar un nombre único para un archivo
const nombreSeguro = generarNombreArchivoSeguro('productos'); // 'productos_20240419T1530_a1b2.json'

// Leer un archivo JSON con valor por defecto
const config = await leerJSONSeguro('config.json', { version: '1.0.0' });

// Guardar un objeto como JSON (crea directorios si no existen)
await guardarJSONSeguro('datos/nuevos/productos.json', datosProductos);

// Calcular el hash de un contenido
const hash = calcularHash(JSON.stringify(datosProductos));
```

### Funciones disponibles

- **Manejo de archivos**:
  - `verificarExisteRuta`, `crearDirectorioSiNoExiste`, `leerJSONSeguro`, `guardarJSONSeguro`
  
- **Generación de identificadores**:
  - `generarNombreArchivoSeguro`, `generarUUID`, `calcularHash`
  
- **Manipulación de rutas**:
  - `esRutaAbsoluta`, `resolverRuta`, `obtenerExtension`, `obtenerNombreBase`
  
- **Validación y utilidades**:
  - `sonObjetosIdenticos`, `tieneEstructuraMinima`, `formatearTamano`, `agregarMetadatos`
