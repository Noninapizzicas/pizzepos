# Módulo Carrito (Cart)

## Propósito

El Módulo Carrito es el encargado de gestionar los productos seleccionados por el camarero para una cuenta activa. Aquí se realiza la edición final antes de confirmar el pedido y enviarlo a impresión.

Es el espacio donde se pueden revisar, modificar o eliminar los productos antes del cierre.

---

## Flujo General

1. El usuario selecciona productos desde el Módulo Productos
2. Cada producto emite `product:finalized`
3. El Core reenvía ese producto al Cart mediante `cart:itemAdded`
4. El Carrito los agrupa, calcula totales y permite modificar
5. El usuario puede:
   - Cambiar cantidades
   - Añadir notas
   - Eliminar productos
   - Confirmar el pedido (se emite `print:requested`)
6. El módulo puede enviar un resumen de cuenta para cocina o barra

---

## Funciones Principales

- Mostrar todos los productos seleccionados
- Agrupar productos iguales
- Calcular subtotal, impuestos y total
- Permitir edición en línea (notas, cantidad)
- Confirmar pedido → impresión
- Opción de marcar como “guardado sin enviar”

---

## Interfaz

- Lista vertical de productos
- Cada ítem muestra:
  - Nombre, icono, variaciones, nota
  - Cantidad editable
  - Botón “eliminar”
  - Precio total por ítem
- Totales al pie
- Botones:
  - “Añadir más” (vuelve a productos)
  - “Guardar pedido”
  - “Imprimir ahora”

---

## Estructura de Datos del Carrito

```json
{
  "cuentaId": "mesa-03",
  "items": [
    {
      "id": "pz1",
      "nombre": "Country",
      "variaciones": ["Sin cebolla", "Salsa Picante"],
      "cantidad": 2,
      "nota": "Cortar en 8",
      "precioUnitario": 10.0,
      "precioTotal": 20.0
    }
  ],
  "subtotal": 20.0,
  "impuestos": 2.1,
  "total": 22.1
}
```

---

## Eventos Escuchados

| Evento | Acción |
|--------|--------|
| `cart:itemAdded` | Añadir producto al carrito |
| `cart:itemRemoved` | Eliminar ítem |
| `cart:updated` | Modificación en cantidad o nota |
| `account:selected` | Cargar carrito asociado |
| `system:reset` | Vaciar carrito actual |

---

## Eventos Emitidos

| Evento | Descripción |
|--------|-------------|
| `cart:cleared` | Carrito vaciado |
| `cart:checkout` | Pedido confirmado |
| `print:requested` | Pedido listo para imprimir |
| `sync:pushCart` | Enviar carrito a otros terminales |
| `account:updated` | Se actualiza el total en cuenta |

---

## Lógica de Agrupación

- Si un producto tiene mismas variaciones y nota, se agrupa
- Si cambia algo (ej: nota diferente), se crea ítem separado
- Cada ítem lleva su `uuid` para edición individual

---

## Personalización

- Notas rápidas: sin cebolla, bien hecho, en caja
- Favoritos: ítems que se repiten mucho se sugieren automáticamente
- Atajos: para cantidades frecuentes (1, 2, 3, etc.)

---

## Flujo de Confirmación

1. El camarero pulsa “Confirmar”
2. Se emite `cart:checkout`
3. Se emite `print:requested` con copia a cocina/barra
4. Se actualiza la cuenta con estado: “En proceso”

---

## Consideraciones Técnicas

- El carrito se guarda asociado a `cuentaId`
- Se puede recuperar en caso de cierre de sesión
- Se sincroniza en tiempo real con otros dispositivos
- Se valida el stock antes de confirmar si está habilitado

---

## Recomendaciones de UX

- Confirmación visual tras añadir
- Animación suave al editar
- Colores para destacar cambios (verde: nuevo, rojo: eliminado)
- Accesibilidad para dispositivos con pantalla pequeña

---

El Módulo Carrito cierra el ciclo de venta antes de la impresión. Es la última oportunidad del camarero para afinar el pedido antes de mandarlo a cocina.
