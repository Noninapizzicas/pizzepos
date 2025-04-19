# frontend_almacenamiento.md

## Prompt para IA
Diseña el archivo de interfaz del módulo `almacenamiento` de PizzePOS. Este componente debe:

- Ser accesible vía navegador.
- Listar todos los complementos disponibles.
- Permitir la carga de archivos JSON con validación.
- Mostrar visualmente errores o confirmaciones.
- No contener lógica del complemento, solo interacción y visualización.

---

## Objetivo
Facilitar la interacción del usuario con los complementos del sistema. Actúa como "ventana" hacia las capacidades del módulo de almacenamiento.

## ¿Qué tecnologías se usan?
- HTML5 semántico
- CSS básico o Tailwind (opcional)
- JavaScript puro o VueJS
- Comunicación con el backend vía `fetch` hacia un endpoint `/almacenamiento`

---

## ¿Qué archivos genera?
Ninguno. Es solo una interfaz de presentación y carga.

## ¿Dónde se coloca?
```
modulos/almacenamiento/frontend/index.html
```

---

## ¿Cómo debe comportarse?
- Al iniciar, detecta los complementos disponibles y los lista dinámicamente.
- Cada complemento muestra:
  - Su nombre
  - Descripción
  - Botón para subir archivo JSON
  - Link para descargar plantilla
- Al subir un archivo:
  - Lo envía por `fetch` al módulo backend
  - Muestra errores si falla la validación
  - Confirma visualmente si se subió bien

---

## Ejemplo visual (simplificado)
```html
<h2>Complemento: Productos</h2>
<p>Permite cargar la carta completa del sistema.</p>
<button>Subir archivo</button>
<a href="/plantillas/productos.json" download>Descargar plantilla</a>
```

---.

## ¿Qué hace único a este componente?
- El usuario no tiene que navegar: simplemente reacciona al estado y las opciones.
- Cada complemento "se monta solo" si está disponible.
- Los formularios se definen por cada complemento.

---

## ¿Quién lo consume?
- Usuarios del sistema para subir o actualizar datos.
- IA para generar nuevos complementos.
- Backend del módulo para gestionar validación y persistencia.

---

## Consideraciones extra
- Este archivo debe ser autoconfigurable: si aparece un nuevo complemento, debe adaptarse.
- La validación no se hace aquí, solo se comunica con backend.
