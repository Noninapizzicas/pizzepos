# Plantilla de Complemento - Módulo Almacenamiento

## Propósito
Esta plantilla define la estructura mínima de un complemento para ser usado por el módulo `almacenamiento`. Un complemento encapsula la lógica de validación y manejo de un tipo de archivo específico que se sube o gestiona dentro del sistema PizzePOS.

## Campos requeridos
- `nombre`: Nombre único del complemento.
- `descripcion`: Descripción textual del propósito del complemento.
- `tipo`: Tipo de archivo que maneja (`archivo-json`, `imagen`, etc.).
- `estructuraEsperada`: Descripción general de la estructura de los datos.
- `validaciones`: Reglas de validación por campo.
- `acciones`: Operaciones que se permiten sobre el archivo (`validar`, `guardar`, `descargar`).
- `plantillaArchivo`: JSON base que sirve como guía para el usuario al subir archivos.

## Uso
Esta plantilla será leída por el módulo `almacenamiento`, que generará interfaces, validaciones y rutas de carga automáticamente.

## Ejemplo de archivo generado a partir de esta plantilla
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "nombre": "Pizza Margarita",
  "activo": true,
  "precio": 9.99
}
```
