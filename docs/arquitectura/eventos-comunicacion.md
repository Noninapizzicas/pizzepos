# Eventos y Comunicación

## Sistema de Comunicación

PizzePOS utiliza un sistema de comunicación basado en eventos a través de WebSocket para permitir que los módulos independientes interactúen entre sí de manera eficiente.

## Arquitectura WebSocket

### Servidor WebSocket Central

El módulo `Server` implementa un microservidor WebSocket que actúa como intermediario para toda la comunicación:

- Puerto por defecto: 8080
- Biblioteca: `ws` (WebSocket ligero para Node.js)
- Soporta múltiples conexiones simultáneas
- Implementa un sistema de reconexión automática

### Protocolo de Mensajes

Todos los mensajes siguen un formato JSON estandarizado:

```json
{
  "meta": {
    "id": "msg-20250510-123456",
    "timestamp": 1715348567123,
    "type": "modulo:accion",
    "source": {
      "moduleId": "cart",
      "deviceId": "terminal-01"
    },
    "target": {
      "moduleId": "printing",
      "deviceId": "*"
    },
    "priority": 1,
    "requiresAck": true
  },
  "payload": {
    // Datos específicos del mensaje
  }
}
```

- `id`: Identificador único del mensaje (para seguimiento y confirmaciones)
- `timestamp`: Momento de creación del mensaje (para ordenación y resolución de conflictos)
- `type`: Tipo de mensaje siguiendo el formato `modulo:accion`
- `source`: Origen del mensaje (módulo y dispositivo)
- `target`: Destinatario del mensaje (puede ser específico o broadcast con "*")
- `priority`: Nivel de prioridad (0: normal, 1: alta, 2: crítica)
- `requiresAck`: Si requiere confirmación de entrega
- `payload`: Datos específicos del mensaje

## Sistema de Eventos

### Tipos de Eventos Principales

1. **Eventos del Sistema**:
   - `system:ready`: El sistema ha completado la inicialización
   - `system:shutdown`: El sistema está cerrando
   - `system:error`: Error crítico a nivel de sistema

2. **Eventos de Módulos**:
   - `module:loaded`: Un módulo se ha cargado correctamente
   - `module:failed`: Error al cargar un módulo
   - `module:activated`: Un módulo se ha activado en la UI

3. **Eventos de Navegación**:
   - `navigation:start`: Inicia navegación entre módulos
   - `navigation:complete`: Navegación completada
   - `navigation:back`: Navegación hacia atrás

4. **Eventos de Cuentas**:
   - `account:created`: Nueva cuenta creada
   - `account:updated`: Modificación de una cuenta
   - `account:closed`: Cierre de una cuenta
   - `account:selected`: Selección de cuenta activa

5. **Eventos de Productos**:
   - `product:selected`: Producto seleccionado
   - `product:customize`: Solicitud de personalización
   - `product:finalized`: Producto finalizado con personalizaciones

6. **Eventos de Carrito**:
   - `cart:itemAdded`: Artículo añadido al carrito
   - `cart:itemRemoved`: Artículo eliminado del carrito
   - `cart:cleared`: Carrito vaciado
   - `cart:checkout`: Proceso de finalización de compra

7. **Eventos de Impresión**:
   - `print:requested`: Solicitud de impresión
   - `print:completed`: Impresión completada
   - `print:failed`: Fallo de impresión

8. **Eventos de Sincronización**:
   - `sync:started`: Inicio de sincronización
   - `sync:completed`: Sincronización completada
   - `sync:conflict`: Conflicto detectado durante sincronización

### Implementación del Bus de Eventos

Cada módulo implementa un bus de eventos basado en el patrón Observer:

```javascript
// Ejemplo simplificado del EventBus
class EventBus {
  constructor() {
    this.subscribers = new Map();
  }

  on(eventName, callback) {
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, []);
    }
    this.subscribers.get(eventName).push(callback);
    return () => this.off(eventName, callback);
  }

  off(eventName, callback) {
    if (!this.subscribers.has(eventName)) return;
    const callbacks = this.subscribers.get(eventName);
    const index = callbacks.indexOf(callback);
    if (index !== -1) callbacks.splice(index, 1);
  }

  emit(eventName, data) {
    if (!this.subscribers.has(eventName)) return;
    this.subscribers.get(eventName).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error en manejador de evento ${eventName}:`, error);
      }
    });
  }
}
```

## Garantía de Entrega

Para mensajes críticos, se implementa un sistema de entrega garantizada:

1. **Confirmación de recepción (ACK)**:
   - El receptor envía un mensaje de confirmación al recibir un mensaje crítico
   - Se registra qué receptores han confirmado la recepción

2. **Cola de mensajes persistente**:
   - Los mensajes críticos se almacenan hasta recibir confirmación
   - La cola sobrevive a reinicios o desconexiones

3. **Política de reintentos**:
   - Reintento automático con backoff exponencial
   - Número configurable de reintentos

## Flujo de Comunicación Típico

### Ejemplo: Añadir producto al carrito

1. En el módulo Products, el usuario selecciona un producto
2. Products emite evento `product:selected` con detalles del producto
3. Server recibe el evento y lo enruta
4. Cart recibe el evento y añade el producto
5. Cart emite evento `cart:itemAdded` para confirmar
6. UI se actualiza en respuesta al evento `cart:itemAdded`

### Ejemplo: Sincronización entre dispositivos

1. Terminal 1 cierra una cuenta y emite `account:closed`
2. Server enruta el evento a todos los dispositivos
3. Terminal 2 recibe `account:closed` y actualiza su estado
4. Terminal 2 envía confirmación de recepción (ACK)
5. Server actualiza estado del mensaje como entregado

## Manejo de Errores en la Comunicación

1. **Errores de conexión**:
   - Detección inmediata de desconexión
   - Cola de mensajes pendientes durante desconexión
   - Reconexión automática con backoff exponencial

2. **Errores de procesamiento**:
   - Aislamiento de errores por módulo
   - Registro detallado para diagnóstico
   - Respuesta con mensaje de error al remitente

3. **Conflictos de datos**:
   - Resolución basada en timestamps
   - Estrategias específicas por tipo de dato
   - Notificación de conflictos no resueltos automáticamente

## Optimización para Termux

- Mensajes compactos para minimizar uso de red
- Compresión opcional para mensajes grandes
- Priorización de mensajes críticos
- Batching para mensajes no críticos
- Funcionamiento offline con sincronización posterior
