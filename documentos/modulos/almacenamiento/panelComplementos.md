
Este archivo describe la implementación visual del **panel de complementos** del módulo `almacenamiento`. Este componente forma parte de la interfaz gráfica del sistema PizzePOS, cumpliendo estrictamente con su filosofía: modularidad, eventos, validación estricta y mínimo acoplamiento.

---

## Ubicación del archivo

El archivo de implementación debe residir en:

```
modulos/almacenamiento/visual/panelComplementos.ts
```

---

## Propósito del componente

Permitir al usuario visualizar, gestionar y operar los complementos cargados en el sistema.

Debe mostrar:

- Lista de complementos disponibles (detectados por `cargadorComplementos`).
- Opciones para:
  - Cargar un archivo JSON asociado a cada complemento.
  - Validarlo contra la plantilla.
  - Guardarlo en disco.
  - Descargarlo (si ya existe).
- Acceso visual a las plantillas para referencia.

---

## Interacción con el sistema

### Requiere acceso a:

- Instancia `cargadorComplementos`.
- Estilos globales desde `/config/estilos.json`.

### Eventos que debe emitir:

- `almacenamiento:archivoSubido`
- `almacenamiento:archivoValidado`
- `almacenamiento:archivoPersistido`
- `almacenamiento:archivoInvalido`

---

## Estructura visual sugerida

- **Panel lateral**: Lista de todos los complementos activos.
- **Área central**:
  - Vista previa de plantilla.
  - Input de archivo (`drag-and-drop` o `file input`).
  - Validación automática al cargar.
  - Botón “Guardar en sistema” (si pasa la validación).
- **Mensajes visuales** de éxito/error en validación y guardado.

---

## Estilo y diseño

- Cargar estilos visuales desde `estilos.json` global.
- No incluir estilos en línea ni hardcodeados.
- Adaptabilidad básica para pantallas táctiles y escritorio.
- Evitar navegación. Todo debe pasar en un solo componente reactivo.

---

## Lógica obligatoria

- Mostrar `nombre`, `tipo`, `descripcion` de cada complemento.
- Botón para cargar archivo y validarlo.
- Botón para visualizar plantilla (`productos.plantilla.json`, por ejemplo).
- Validación automática usando `manejador.validar`.
- Guardado usando `cargadorComplementos.guardar`.
- Carga de archivo existente con `cargadorComplementos.cargar`.

---

## Check List de implementación (para IA o dev)

- [ ] Usa instancia `cargadorComplementos`.
- [ ] Carga estilos desde `estilos.json`.
- [ ] Emite eventos adecuados.
- [ ] No hay rutas expuestas ni navegación clásica.
- [ ] Es autónomo y puede funcionar sin conexión externa.
- [ ] Los archivos cargados pasan validación antes de ser persistidos.
- [ ] Muestra claramente errores y confirmaciones.
- [ ] Expone plantilla de ejemplo al usuario para cada complemento.
- [ ] Todo archivo gestionado va a `modulos/almacenamiento/data`.

---

## Consideraciones finales

Este panel actúa como **puente visual entre el usuario y el sistema modular de complementos**. No implementa lógica de negocio, solo orquesta acciones e interfaces. Su misión es: **mostrar, validar, persistir y respetar la estructura de cada complemento** con claridad y simplicidad.


