# almacenamiento/validacion/validador.ts

## Prompt para IA
Diseña el archivo `validador.ts` para el módulo `almacenamiento` de PizzePOS. Este archivo se encarga de:

- Validar archivos JSON subidos por los usuarios usando Zod.
- Apoyarse en plantillas de validación externas (`.plantilla.json`) específicas para cada tipo de archivo.
- Emitir eventos cuando la validación es exitosa o falla.
- Ser usado por el `gestorArchivos.ts` antes de guardar o importar cualquier archivo.

Ten en cuenta que el sistema es modular, minimalista, sin navegación clásica, basado en eventos y sin persistencia innecesaria.

---

## Propósito del archivo
Este archivo valida los datos de entrada que llegan en formato JSON desde archivos externos. Garantiza que cumplan la estructura requerida por el sistema antes de aceptarlos o guardarlos.

## Tecnologías y librerías
- `Zod`: para validación de esquemas
- `fs/promises`: para leer la plantilla de validación correspondiente
- `EventBus`: para emitir resultados de la validación
- Tipado fuerte con TypeScript

## Entrada y salida
- **Entrada esperada**:
  - Un archivo JSON con datos del sistema (ej. productos, cuentas, configuraciones)
  - Una plantilla de validación (`productos.plantilla.json`, etc.)
- **Salida esperada**:
  - `true` si el archivo es válido
  - `false` si el archivo tiene errores
  - En ambos casos, se emite un evento describiendo el resultado

## Funcionalidades necesarias
- Función `validarArchivo(archivo: string, tipo: string): Promise<boolean>`
- Función auxiliar `cargarPlantilla(tipo: string): Promise<ZodSchema>`
- Soporte para errores legibles por humanos
- Eventos emitidos según resultado

## Eventos que debe emitir
- `almacenamiento:validacionExitosa`: El archivo fue validado y es correcto
- `almacenamiento:validacionFallida`: El archivo tiene errores
- `core:errorDetectado`: Fallo crítico al intentar validar

## Estilo y convenciones
- En español
- Sin abreviaturas
- Validaciones explícitas
- Funciones puras y fáciles de testear
- Modular y reutilizable

---

## Contexto global
- Este archivo es parte del módulo `almacenamiento`
- Lo usan `gestorArchivos.ts` y otros módulos que quieran validar antes de usar datos
- Las plantillas se ubican en `/plantillas/` y deben coincidir con el tipo de archivo (ej. `productos.plantilla.json`)
