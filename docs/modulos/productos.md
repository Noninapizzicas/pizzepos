# Módulo Productos

## Propósito

Este módulo se encarga de mostrar el catálogo visual de productos al camarero tras crear una cuenta (mesa, barra, para llevar). Es el punto clave donde comienza la venta.

Su interfaz está pensada para ser táctil, rápida y sin fricción, permitiendo tanto añadir productos directamente como personalizarlos cuando es necesario.

---

## Flujo General

1. Desde el Módulo Cuentas, al crear una nueva cuenta, el sistema activa `products`.
2. Se muestra una **vista de categorías** y productos.
3. El camarero puede:
   - **Tocar directamente un producto** para añadirlo al carrito
   - O **personalizarlo** con variaciones antes de añadir
4. El sistema envía el producto ya decidido al Módulo Carrito (`cart:itemAdded`)

---

## Composición del Botón de Producto

En móvil (interfaz principal):

- Se muestran **2 productos por fila**
- Cada producto con **botón dividido visualmente** si tiene ingredientes:

| Zona | Tamaño | Acción |
|------|--------|--------|
| Izquierda | 70% | Añadir directo al carrito |
| Derecha | 30% | Abrir pantalla de variaciones |

**Nota:**  
Solo se aplica la división 70/30 si el producto tiene ingredientes.  
Para productos simples como bebidas o extras, el botón es completo.

---

## Tipos de Producto

### 1. Producto Simple

- Ej: agua, entrante, postre
- Se añade directamente sin pasos intermedios
- Puede tener extras como “con hielo”, “sin tomate”, etc.

### 2. Producto con Ingredientes

- Ej: pizzas Pizzicas
- Botón dividido 70/30
- Variaciones posibles:
  - Ingredientes con "sin" (ej: sin cebolla)
  - Añadir ingredientes adicionales desde `variaciones.json`

### 3. Pizza al Gusto (Especial)

- Producto visible dentro de la categoría "Pizzicas"
- Al pulsarlo se lanza un **flujo especial**:
  - Se muestran todas las variaciones posibles agrupadas
  - El usuario elige lo que quiera
  - Precio base + extras seleccionados
- También aparece como opción válida dentro de **mitad/mitad**

### 4. Pizza Mitad/Mitad (Botón Especial)

- No listado como producto estándar
- Al pulsarlo:
  - Se muestra el listado completo de pizzas `Pizzicas`
  - El camarero elige **dos mitades**
  - Se combina en un nuevo producto
  - Precio = el más caro de los dos
  - Se puede usar “al gusto” como una de las mitades

---

## Submódulos

### `variaciones.js`

- Genera opciones a partir de ingredientes del producto
- Añade opciones adicionales desde `variaciones.json`
- Maneja lógica de “sin”, salsas, toppings, extras

### `mitad.js`

- Controla el flujo de selección de dos productos
- Crea la ficha combinada
- Calcula el precio automáticamente
- Emite `product:finalized` con estructura mitad/mitad

### `al-gusto.js`

- Muestra todas las categorías de ingredientes/variaciones
- Selección libre, con precio incremental
- Devuelve un producto especial con la composición seleccionada

---

## Eventos Emitidos

| Evento | Descripción |
|--------|-------------|
| `product:selected` | Producto simple o completo añadido |
| `product:customize` | Abre variador o flujo especial |
| `product:finalized` | Resultado tras personalización o mitad |

---

## Datos de Catálogo

```json
{
  "id": "pz1",
  "name": "Country",
  "price": 10.0,
  "category": "Pizzicas",
  "ingredients": [
    "Tomate", "Salsa BBQ", "Nata", "Pollo", "Queso", "Cebolla", "Bacon"
  ]
}
```

Este producto genera automáticamente:
- Versión directa al tocar (lado 70%)
- Al tocar el lado 30%, se ofrece:
  - Quitar ingredientes (sin cebolla, sin nata…)
  - Añadir otros (salsas, huevo, picante…)

---

## Personalización Automática

Si un producto tiene `ingredients`, se genera una lista de `variaciones` tipo “sin” para cada uno.

Se suman las definidas en `variaciones.json`, agrupadas en:
- Salsas
- Extras
- Toppings frecuentes

---

## Comportamiento Visual

- Categorías en horizontal (scroll táctil)
- Productos en grid
- Iconos grandes + nombres cortos
- Colores por categoría (ej: pizzas = rojo, bebidas = azul)
- Modo oscuro automático si es de noche

---

## Extensibilidad

- Se pueden crear nuevos submódulos especiales (`comboMenu.js`, etc.)
- Productos pueden definir `tipoEspecial` en el JSON para disparar lógica
- El sistema puede mostrar otras interfaces táctiles (pasos guiados)

---

## Consideraciones Técnicas

- Todos los productos se leen desde `productos.json`
- Las variaciones desde `variaciones.json`
- Las selecciones se almacenan en la cuenta activa
- Se emiten eventos para sincronizar con otros dispositivos

---

## Ejemplo de flujo: Pizza Mitad/Mitad

1. El camarero pulsa el botón "Mitad/Mitad"
2. Se despliega el catálogo de `Pizzicas`
3. Elige “Country” y luego “R&B”
4. Se genera un producto con:
   - nombre: “Mitad Country / Mitad R&B”
   - precio: 10€
   - ingredientes combinados
   - posibilidad de añadir variaciones
5. Se confirma y se envía al carrito

---

## Resultado Deseado

El camarero debe poder:

- Tocar 2 veces y tener una pizza lista
- Personalizar solo si quiere, sin fricción
- Usar botones como “mitad” o “al gusto” de forma visual, sin pensar en lógica
- Ver siempre el precio final antes de confirmar

---

PizzePOS convierte el catálogo en un sistema de selección directa. No hay menús complejos, todo es visual, rápido y centrado en el flujo real de una venta.
