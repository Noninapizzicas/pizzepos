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
