# microservidor/modulos/almacenamiento.md

## Prompt para IA
Diseña el módulo `almacenamiento` de PizzePOS para manejar de forma robusta, segura y extensible la carga, validación y persistencia de archivos JSON de configuración y datos.

Este módulo debe:

- Ofrecer una interfaz visual mínima para seleccionar y cargar archivos (modo cliente).
- Validar la estructura de los archivos usando plantillas JSON (esquemas Zod o similares).
- Guardar archivos localmente en rutas predeterminadas según tipo.
- Notificar al core sobre cambios de configuración, incorporación de datos nuevos o fallos.
- Emitir eventos como `almacenamiento:archivoCargado`, `almacenamiento:archivoInvalido`, `almacenamiento:archivoPersistido`.
- Ser capaz de leer, sobreescribir, eliminar y respaldar archivos en formato `.json`.

---

## Filosofía de diseño aplicada
- **Estructura reactiva y sin navegación**: Cada acción de carga o validación activa eventos y estados inmediatos, sin necesidad de navegación por menús.
- **Configuración declarativa**: Cada tipo de archivo tiene una plantilla que determina su estructura, ubicación y comportamiento.
- **Simplicidad operativa**: El operador solo ve botones o acciones posibles en base a los plugins instalados (complementos).
- **Extensibilidad modular**: Cada tipo de archivo (productos, variaciones, menús) funciona como un complemento que agrega funcionalidad sin modificar el núcleo.

---

## Tecnologías
- `Zod`: validación estructural.
- `fs/promises`: lectura y escritura de archivos.
- `EventBus`: emisión de eventos del sistema.
- JSON plano + plantillas de validación.
- Soporte opcional de interfaz visual HTML (subida básica).

---

## Esquema general del complemento (plugin) archivo
```json
{
  "tipo": "productos",
  "descripcion": "Archivo de productos cargable en memoria",
  "estructuraEsperada": "plantillas/productos.schema.json",
  "destino": "datos/productos.json",
  "persistente": true,
  "usaUI": true
}
```

---

## Archivos previstos en este módulo
- `cargador.ts`: lógica para subir archivos desde UI.
- `validador.ts`: compara contra la plantilla.
- `gestorArchivos.ts`: guarda y lee archivos.
- `respaldo.ts`: crea copia de seguridad automática.
- `eventos.ts`: emite eventos al sistema.

---

## Eventos emitidos
- `almacenamiento:archivoCargado`
- `almacenamiento:archivoInvalido`
- `almacenamiento:archivoPersistido`
- `almacenamiento:error`

---

## Interacción con otros módulos
- `core`: para validación de configuración.
- `productos`, `cuentas`, `variaciones`: consumen archivos cargados.

---

## Objetivo
Un sistema de almacenamiento declarativo donde cada complemento define:
- Qué estructura debe tener su archivo.
- Dónde debe guardarse.
- Qué eventos dispara.
- Qué acciones se habilitan si está presente.

Con ello, el sistema puede detectar nuevos complementos automáticamente y adaptar la interfaz y la lógica sin necesidad de reiniciar o reconfigurar manualmente.
