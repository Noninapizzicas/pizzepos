# almacenamiento.ts

## Prompt para IA
Desarrollá el archivo `almacenamiento.ts` para el módulo `almacenamiento` del sistema PizzePOS. Su propósito es ofrecer funciones centralizadas para gestionar archivos del sistema, validando estructura, organizando rutas por tipo de documento, y emitiendo eventos relevantes.

---

## Propósito del archivo
Este archivo gestiona la lógica central del módulo de almacenamiento. Su función es cargar, guardar, validar y distribuir archivos de configuración y contenido como productos, variaciones, cartas, etc. Permite además realizar backups y restauraciones, siempre con validación previa.

## Tecnología involucrada
- `Zod`: para validar la estructura de cada archivo
- `fs/promises`: para leer y escribir archivos
- `EventBus`: para notificar operaciones importantes o errores
- `crypto`: para generar identificadores únicos en eventos
- Posiblemente `path` para normalizar rutas

## Funcionalidades esperadas

### Funciones de carga
- `leerArchivo(ruta: string): Promise<string | null>`: lee el contenido de un archivo como string.
- `leerJSON<T>(ruta: string): Promise<T | null>`: lee un archivo y lo parsea a JSON, retornando `null` si falla.

### Funciones de escritura
- `guardarArchivo(ruta: string, contenido: string): Promise<boolean>`: guarda un archivo plano.
- `guardarJSON(ruta: string, datos: any): Promise<boolean>`: convierte a JSON y guarda el archivo.

### Validaciones
- `validarArchivo(ruta: string, tipo: string): Promise<boolean>`: valida el contenido según plantilla esperada.
- Se asume que cada tipo (`productos`, `variaciones`, etc.) tiene su esquema Zod en otra carpeta.

### Copias de seguridad
- `crearBackup(tipo: string): Promise<boolean>`: guarda una copia con timestamp del archivo.
- `restaurarBackup(tipo: string, fecha: string): Promise<boolean>`: restaura una versión anterior.

## Estructura y rutas
- Todos los archivos viven en `/data/almacenamiento/{tipo}/archivo.json`
- Las copias de seguridad van en `/data/almacenamiento/{tipo}/backups/archivo_YYYYMMDD-HHmmss.json`

## Eventos emitidos
- `almacenamiento:archivoCargado`
- `almacenamiento:archivoGuardado`
- `almacenamiento:backupCreado`
- `almacenamiento:backupRestaurado`
- `core:errorDetectado` en cualquier error crítico

## Estilo
- Código en español
- Modular
- Altamente descriptivo y comentado

## Consideraciones especiales
- El módulo no define estructura de archivos específicos, solo los gestiona.
- Cada “complemento” es responsable de definir su propio esquema Zod.
- Todos los errores deben ser capturados y emitidos como eventos.

