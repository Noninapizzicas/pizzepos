# Módulo Almacenamiento - Panel de Complementos

## Propósito

Este archivo describe el diseño y comportamiento del _Panel de Complementos_ del módulo `almacenamiento` de PizzePOS. Este panel representa una interfaz visual que lista, organiza y permite interactuar con los complementos cargados dinámicamente en tiempo de ejecución.

---

## Punto de entrada y activación

- **Ruta protegida:** `/867?modo=panel`
- **Protección:** Solo accesible con dispositivos validados desde la configuración.
- **Disparador:** No responde a eventos del sistema. Es una acción deliberada del usuario autorizado.
- **Filosofía aplicada:** Acceso intencional, protegido y consciente. No se navega por accidente.

---

## Función principal

El _Panel de Complementos_ actúa como el tablero visual desde donde se:

- Visualizan todos los complementos disponibles.
- Accede a sus plantillas para ver estructura.
- Sube nuevos archivos al sistema, validados y persistidos.
- Visualiza errores y estados de persistencia.
- Permite restaurar desde backup si el complemento lo admite.

---

## Carga de Complementos

El panel obtiene la lista desde el sistema `cargador.ts`, quien:

- Detecta todos los complementos en `/almacenamiento/complementos`
- Valida que tengan metadatos `.meta.json`
- Carga su lógica con un archivo `.ts` correspondiente
- Accede a sus plantillas desde `/almacenamiento/plantillas/*.json`

---

## Interacción con el usuario

- Vista estilo "grid" con tarjetas por complemento
- Cada tarjeta muestra: Nombre, descripción, icono y acciones:
  - Ver plantilla
  - Subir archivo
  - Descargar actual
  - Restaurar (si el complemento lo permite)
- El panel se adapta a móviles y pantallas táctiles

---

## Estilos visuales

Toda la parte visual se adapta a `config/estilos.json`, incluyendo:

- Colores de fondo
- Tipografía
- Bordes y sombras
- Íconos
- Tamaños de botones

---

## CheckList para implementación

- [x] Listar todos los complementos activos
- [x] Ver plantilla en formato visual (estructura esperada)
- [x] Subida drag & drop o input file
- [x] Validación antes de persistir
- [x] Confirmación al guardar
- [x] Evento emitido al guardar correctamente
- [x] Descarga del archivo persistido
- [x] Restauración desde backup si aplica
- [x] Estilos desde `estilos.json`
- [x] No navegación, solo interfaz de acción directa

---

## Eventos clave emitidos

- `almacenamiento:complementosCargados`
- `almacenamiento:archivoPersistido`
- `almacenamiento:archivoInvalido`
- `almacenamiento:archivoCargado`
- `core:errorDetectado` (si falla algo grave)

---

## Consideraciones

- El panel es una interfaz de administración. Nunca visible al cliente.
- Requiere intencionalidad, acceso directo y validación previa.
- Es el punto base para mantenimiento del sistema desde interfaz gráfica.
