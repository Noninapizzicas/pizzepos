---
prompt: |
  Genera el archivo `ws.ts` del módulo `microservidor` para PizzePOS.
  Debe levantar un servidor WebSocket nativo, aceptar múltiples conexiones desde dispositivos,
  recibir eventos en formato JSON, y reenviarlos crudos al EventBus para que el módulo `corazon` los procese.
  No debe validar eventos ni guardar estado, solo actuar como receptor y despachador.

---

# Archivo: `ws.ts` – Módulo `microservidor`

Este archivo implementa un **servidor WebSocket nativo**.  
Recibe conexiones desde dispositivos en red local, escucha mensajes estructurados y los emite al EventBus global.

---

## Funciones esperadas

- Levantar un servidor WebSocket (puerto definido por config)
- Aceptar múltiples conexiones simultáneas
- Recibir mensajes JSON y validarlos mínimamente
- Emitir eventos crudos al sistema: `microservidor:eventoEntrante`
- Emitir errores si hay fallos de conexión

---

## Stack y dependencias

- `ws` (WebSocket nativo de Node.js)
- No usa Express ni HTTP
- `Zod` no se usa aquí (validación queda para `corazon`)
- `EventBus` del sistema

---

## Eventos involucrados

**Emite:**
- `microservidor:eventoEntrante` (con el mensaje recibido)
- `microservidor:conexionEstablecida` (al conectar un cliente)
- `microservidor:errorConexion` (al fallar parsing o conexión)

---

## Estructura de eventos esperada

El mensaje entrante debe ser JSON con esta estructura:

```json
{
  "meta": {
    "id": "uuid",
    "timestamp": "ISODate",
    "tipo": "modulo:evento",
    "origen": "nombreModulo",
    "prioridad": 1
  },
  "payload": { ... },
  "contexto": {
    "dispositivoId": "terminal-01"
  }
}
```

Este archivo **no valida estructura**, solo intenta hacer `JSON.parse` y reenviar al `EventBus`.

---

## Consideraciones

- Este archivo no guarda conexiones, pero puede hacerlo si es necesario en el futuro.
- Si el mensaje no es JSON válido, emite `microservidor:errorConexion`.
- Debe estar preparado para reconexiones múltiples sin colapsar.
- Requiere ser iniciado desde `index.ts` vía `iniciarWebSocket()`

---

## Ruta esperada

```
modulos/microservidor/servidor/ws.ts
```
