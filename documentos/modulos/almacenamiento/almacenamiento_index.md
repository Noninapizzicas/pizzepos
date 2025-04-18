# almacenamiento/index.ts

## Prompt para IA
Diseña el archivo `index.ts` para el módulo `almacenamiento` del sistema PizzePOS. Este archivo actúa como punto de entrada principal y debe cumplir con las siguientes funciones:

- Inicializar el sistema de almacenamiento del sistema.
- Cargar y validar todos los complementos activos (archivos JSON).
- Usar los complementos para habilitar funcionalidades específicas como subir productos, variaciones, configuraciones, etc.
- Exponer funciones clave para listar complementos y consultar sus metadatos.
- Emitir eventos para registrar el estado del sistema de almacenamiento y errores.

La filosofía del sistema es modular, declarativa, sin navegación clásica, sin persistencia en base de datos, y completamente basada en archivos y eventos.

---

## Propósito del archivo
Este archivo orquesta la inicialización y operación del sistema de almacenamiento. Coordina la carga de archivos, aplica validaciones específicas por tipo, y gestiona el acceso estructurado a estos datos.

## Tecnologías y librerías
- Node.js nativo (`fs/promises`, `path`)
- `Zod` para validación de estructura de los archivos
- `crypto` para generar IDs únicos
- EventBus global

## Entrada y salida
- **Entrada esperada**: Archivos JSON en directorios específicos bajo `/datos/almacenamiento/`, incluyendo `productos.json`, `variaciones.json`, etc.
- **Salida esperada**: Objetos validados accesibles mediante funciones como `getArchivo("productos")`.

## Funcionalidades necesarias
- Cargar todos los archivos desde el directorio de datos.
- Detectar automáticamente los complementos disponibles.
- Validar la estructura de cada archivo con su plantilla correspondiente.
- Emitir eventos de estado y error.
- Permitir exportar y respaldar los datos actuales.

## Estructura esperada
```
almacenamiento/
├── datos/
│   ├── productos.json
│   ├── variaciones.json
│   └── configSistema.json
├── plantillas/
│   ├── productos.plantilla.json
│   ├── variaciones.plantilla.json
│   └── configSistema.plantilla.json
├── index.ts
```

## Eventos que debe emitir
- `almacenamiento:complementoCargado`: Al cargar un archivo con éxito.
- `almacenamiento:errorValidacion`: Si falla la validación de algún archivo.
- `core:errorDetectado`: Para errores generales del sistema.

## Estilo y convenciones
- Código limpio, modular, con comentarios descriptivos.
- Nombres descriptivos en español.
- Eventos bien tipados y consistentes.

---

## Contexto global
- Este archivo se ejecuta al iniciar el módulo `almacenamiento`.
- Se usa como base para cargar los datos del sistema a partir de archivos.
- Se comunica con otros módulos como `productos`, `core`, `salida`.

