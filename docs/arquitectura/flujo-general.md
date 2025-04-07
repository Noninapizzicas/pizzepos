# Flujo General de PizzePOS

## Visión General

PizzePOS es un sistema modular para gestión de ventas en pizzerías, optimizado para dispositivos móviles con Termux. La arquitectura está diseñada para ser ligera, independiente y enfocada exclusivamente en el proceso de venta.

## Componentes Principales

El sistema se compone de módulos independientes que se comunican entre sí mediante un microservidor WebSocket:

1. **Core Module**: Punto de entrada que facilita la navegación entre módulos
2. **Server Module**: Microservidor WebSocket para comunicación entre módulos
3. **Accounts Module**: Gestión de zonas, mesas y tipos de cuentas
4. **Products Module**: Catálogo de productos y variaciones
5. **Cart Module**: Gestión del carrito de compra
6. **Printing Module**: Gestión de impresoras y tickets
7. **Calls Module**: Integración con telefonía para pedidos
8. **Sync Module**: Sincronización entre dispositivos
9. **Uploader Module**: Gestión de archivos de configuración

## Flujo de Información

### 1. Creación de Cuenta/Pedido

```
[Accounts Module] → Selección de mesa/tipo → [Core] → Navegación → [Products Module]
```

- El usuario inicia en el módulo de cuentas
- Selecciona una ubicación (mesa) o tipo de cuenta (delivery, barra)
- Se crea una cuenta con ID único
- El Core activa el módulo de productos para selección

### 2. Selección de Productos

```
[Products Module] → Selección de categoría → Selección de producto → [Cart Module]
```

- El usuario navega por categorías de productos
- Selecciona productos individuales
- Configura variaciones si es necesario (ingredientes, tamaños)
- Los productos seleccionados se envían al carrito

### 3. Gestión del Carrito

```
[Cart Module] → Edición → Cálculos → Finalización → [Printing Module]
```

- El carrito recibe y muestra productos seleccionados
- Permite edición (cantidad, notas, eliminación)
- Calcula subtotales, impuestos y total
- Al finalizar, envía el pedido a impresión

### 4. Impresión y Cierre

```
[Printing Module] → Generación de tickets → Impresión → [Accounts Module]
```

- Se generan tickets para cocina y cliente
- Se envían a impresoras configuradas
- El estado de la cuenta se actualiza (pedido en proceso)
- Al finalizar el servicio, se cierra la cuenta

### 5. Sincronización (Proceso Paralelo)

```
[Sync Module] ↔ [Server Module] ↔ Otros dispositivos
```

- Cambios en cuentas, productos o pedidos se sincronizan
- El módulo servidor gestiona la comunicación
- Se resuelven conflictos automáticamente
- Garantiza consistencia entre dispositivos

## Persistencia de Datos

- Datos guardados en archivos JSON
- Configuración persistente entre sesiones
- Datos de ventas se envían y eliminan diariamente
- Respaldos automáticos de configuración

## Comunicación Entre Módulos

Toda la comunicación utiliza un sistema de eventos a través del servidor WebSocket:

1. Un módulo emite un evento con datos
2. El servidor recibe y enruta el evento
3. Los módulos suscritos reciben la notificación
4. Cada módulo procesa el evento según su responsabilidad

Este enfoque de acoplamiento bajo permite que:
- Los módulos evolucionen independientemente
- Se puedan añadir nuevas funcionalidades sin modificar módulos existentes
- El sistema sea robusto ante fallos parciales

## Consideraciones para Termux

- Optimizado para dispositivos móviles
- Uso eficiente de recursos (memoria, CPU)
- Interfaz táctil intuitiva
- Soporte para impresoras térmicas
- Funcionamiento con conectividad intermitente
