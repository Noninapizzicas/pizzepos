# almacenamiento/respaldo.ts

## Prompt para IA
Diseña el archivo `respaldo.ts` para el módulo `almacenamiento` de PizzePOS. Este archivo debe encargarse de:

- Crear una copia de seguridad automáticamente antes de modificar cualquier archivo JSON gestionado por el sistema.
- Almacenar los respaldos en un subdirectorio `/respaldo/` dentro de `almacenamiento`.
- Agregar marca de tiempo única a cada respaldo.
- Emitir eventos `almacenamiento:respaldoCreado` y `core:errorDetectado` según el resultado.
- Proveer funciones para listar, restaurar o eliminar respaldos.

### Consideraciones
- Las copias deben mantenerse separadas por módulo o tipo (ej: productos, cuentas, etc).
- Deben ser archivos `.bak.json`.
- No requiere frontend ni interacción humana directa.
- Persistencia total en disco.

## Estructura esperada de respaldo
```
almacenamiento/respaldo/
├── productos/
│   ├── productos_20240417T1105.bak.json
│   └── productos_20240416T1811.bak.json
├── cuentas/
│   └── cuentas_20240417T1107.bak.json
```

## API esperada

### `crearRespaldo(nombreArchivo: string, contenido: string): Promise<boolean>`
Crea un respaldo con timestamp. Retorna true si se creó exitosamente.

### `listarRespaldos(tipo: string): string[]`
Devuelve nombres de archivo dentro de `/respaldo/{tipo}/`.

### `restaurarRespaldo(ruta: string): Promise<string>`
Devuelve el contenido de un respaldo como string.

### `eliminarRespaldo(ruta: string): Promise<void>`
Elimina un archivo de respaldo dado.

## Eventos emitidos
- `almacenamiento:respaldoCreado`
- `core:errorDetectado`

## Estilo
- Español, sin abreviaturas, con comentarios.
- Modular, limpio y validado.

