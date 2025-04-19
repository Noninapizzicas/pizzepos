# almacenamiento/helpers.ts

## Prompt para IA
Diseña el archivo `helpers.ts` para el módulo `almacenamiento` de PizzePOS. Este archivo debe contener funciones utilitarias comunes relacionadas con la manipulación de archivos JSON, rutas de almacenamiento, verificación de existencia, y generación de nombres únicos o backups. Se usará como soporte interno para las demás funciones del módulo.

---

## Propósito del archivo
Centralizar funciones de ayuda reutilizables para el módulo `almacenamiento`, especialmente las que trabajan con archivos, nombres dinámicos, validación básica de estructura y manipulación de rutas.

## Tecnologías y librerías
- `fs/promises` de Node.js para operaciones asíncronas con archivos.
- `path` para gestión segura de rutas.
- `crypto` para generación de IDs o nombres únicos.
- `EventBus` global para emitir eventos del sistema.

## Entrada y salida esperadas
- Entradas: rutas relativas, nombres de archivos, datos a guardar, datos a validar.
- Salidas: booleanos, strings, objetos validados, paths resueltos.

## Funcionalidades necesarias
- `generarNombreArchivoSeguro(nombreBase: string): string`  
  Crea un nombre único con fecha y hora para backups o copias temporales.

- `verificarExisteRuta(ruta: string): Promise<boolean>`  
  Chequea si una ruta existe sin lanzar error si no existe.

- `crearDirectorioSiNoExiste(ruta: string): Promise<void>`  
  Asegura que una carpeta exista antes de guardar archivos.

- `leerJSONSeguro(ruta: string): Promise<any>`  
  Carga un archivo JSON si existe y lo parsea, o lanza error si está mal formado.

- `guardarJSONSeguro(ruta: string, datos: any): Promise<void>`  
  Guarda un objeto como JSON, asegurando estructura válida.

- `emitirError(mensaje: string, error: unknown): void`  
  Envía un evento global con info detallada del error para ser capturado por `core`.

## Eventos que puede emitir
- `core:errorDetectado`: si ocurre un fallo de lectura, escritura o validación.
- `almacenamiento:directorioCreado`: al generar una nueva ruta que no existía.

## Estilo y convenciones
- Español, sin abreviaturas.
- Código limpio y modular.
- Funciones puras siempre que sea posible.

---

## Relación con otros archivos
- `almacenamiento.ts`: usa sus funciones para guardar y cargar datos.
- `respaldo.ts`: usa funciones para generar backups y nombres únicos.

