# almacenamiento/gestorArchivos.ts

## Prompt para IA
Crea el archivo `gestorArchivos.ts` para el módulo `almacenamiento` de PizzePOS. Este archivo centraliza la gestión de archivos del sistema, incluyendo lectura, validación, guardado y eliminación de archivos JSON de configuración.

El archivo debe seguir la filosofía del sistema:
- Modular
- Basado en eventos
- Sin navegación clásica
- Con mínima persistencia (pero persistente cuando se requiere)
- Validación estricta con plantillas
- Facilita backups

## Propósito del archivo
Gestiona el ciclo completo de vida de archivos JSON usados por otros módulos:
- Leer desde disco
- Validar contra plantilla
- Guardar si es válido
- Eliminar si es necesario
- Emitir eventos relacionados

## Funcionalidades requeridas
- `leerArchivo(ruta: string): Promise<string | null>`
- `guardarArchivo(ruta: string, contenido: string): Promise<boolean>`
- `validarArchivo(ruta: string, plantilla: ZodSchema): Promise<boolean>`
- `eliminarArchivo(ruta: string): Promise<boolean>`
- `hacerBackup(ruta: string): Promise<boolean>`

## Tecnologías utilizadas
- `fs/promises`: para operaciones de archivos
- `Zod`: para validaciones
- `EventBus`: para emitir eventos
- `path`: para manejo seguro de rutas

## Entrada y salida
- Entrada: ruta de archivo, contenido plano o JSON, plantilla de validación
- Salida: booleanos de éxito/error, logs de consola, eventos emitidos

## Eventos que debe emitir
- `almacenamiento:archivoLeido`
- `almacenamiento:archivoGuardado`
- `almacenamiento:archivoEliminado`
- `almacenamiento:archivoInvalido`
- `almacenamiento:backupRealizado`
- `core:errorDetectado`

## Estilo y convenciones
- Código en español
- Modular
- Sin side-effects fuera de funciones
- Eventos antes de retornos

## Contexto global
Este archivo es clave para el funcionamiento del módulo almacenamiento y debe ser completamente independiente de los tipos de archivo (productos, configuración, etc). Su diseño debe ser robusto, seguro y explícito.

