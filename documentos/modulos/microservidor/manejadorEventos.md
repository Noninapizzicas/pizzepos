# manejadorEventos.ts

**Ubicación:** `modulos/microservidor/eventos/manejadorEventos.ts`  
**Tecnologías:** Node.js, TypeScript, EventEmitter (API nativa de Node)

## Propósito del Archivo

Este archivo implementa el "bus de eventos" principal del microservidor.  
Es responsable de centralizar el manejo de todos los eventos internos del módulo microservidor.

## Rol en el Sistema

- Centraliza la escucha y emisión de eventos.
- Permite que los distintos componentes del microservidor (WebSocket, autenticación, etc.) se comuniquen.
- No transforma eventos ni accede a red. Solo reenvía.
- Puede ser compartido como un EventEmitter global (con `global.eventBus`).

## ¿Qué hace exactamente?

- Crea un singleton de `EventEmitter`.
- Lo guarda en `global.eventBus` para que sea accesible desde cualquier parte del microservidor.
- Expone funciones utilitarias como `emitirEventoGlobal` o `suscribirseEvento`.

## ¿Qué NO hace?

- No transforma eventos.
- No accede a red, archivos ni bases de datos.
- No tiene lógica de negocio.
- No persiste nada.

## Estructura esperada

```ts
import { EventEmitter } from 'events'

const eventBus = new EventEmitter()
global.eventBus = eventBus

export const emitirEventoGlobal = (tipo: string, datos: any) => {
  eventBus.emit(tipo, datos)
}

export const suscribirseEvento = (tipo: string, callback: (datos: any) => void) => {
  eventBus.on(tipo, callback)
}
```

## Detalles técnicos

- Se utiliza `EventEmitter` porque es liviano, nativo y adecuado para microservicios.
- `global.eventBus` permite compartir una instancia común sin necesidad de importar explícitamente en todos lados.
- No requiere ninguna librería externa.

## Consideraciones

- Podría reemplazarse en el futuro por un bus más robusto como `mitt`, pero `EventEmitter` es suficiente ahora.
- Toda emisión o escucha debe validarse a nivel del evento para evitar fugas de datos o ciclos infinitos.
- Se recomienda loggear los eventos importantes en producción.

## Resultado esperado

Una vez inicializado, cualquier archivo puede hacer:

```ts
global.eventBus.emit('miEvento', { clave: 'valor' })
```

Y otro archivo, incluso en otra carpeta, puede hacer:

```ts
global.eventBus.on('miEvento', datos => {
  console.log('Evento recibido:', datos)
})
```

## Estado

**Listo para implementar**. No requiere plantillas ni archivos auxiliares.
