---
prompt: |
  Genera el código completo del módulo `microservidor` de PizzePOS. 
  Este módulo expone un servidor WebSocket nativo que recibe eventos JSON desde dispositivos conectados 
  y los reenvía al módulo `corazon`. Debe validar que el dispositivo esté autorizado, emitir eventos internos de conexión 
  y error, y mantenerse simple, sin lógica de persistencia ni transformación.

---

# Módulo `microservidor` – PizzePOS

Módulo que actúa como **puerta de entrada por WebSocket** al sistema. Permite a dispositivos conectados enviar eventos estructurados,
que son validados y reenviados al `corazon`. A su vez, puede recibir eventos del sistema y distribuirlos a dispositivos conectados.

---

## Estructura de directorios

```
modulos/microservidor/
├── config/
│   └── config.ts
├── eventos/
│   └── manejadorEventos.ts
├── servidor/
│   └── ws.ts
├── validacion/
│   └── autenticacion.ts
├── utils/
│   └── helpers.ts
└── index.ts
```

---

## Funciones clave

- Levanta un WebSocket nativo local
- Valida cada conexión con `dispositivos.json`
- Reenvía eventos al `corazon` sin transformación
- Informa conexiones exitosas y errores
- Expone sus propios eventos para monitoreo

---

## Stack tecnológico

- Node.js
- WebSocket (API nativa)
- Zod (validación)
- date-fns (fechas)
- No usa frontend ni estilos

---

## Convenciones

- Eventos en formato `modulo:evento`
- Código en español
- Modular y desacoplado
- Sin interfaces visuales
- Validación estructurada con Zod

---

## Eventos

**Escucha:**
- `core:eventoDistribuido`
- `core:llaveRevocada`

**Emite:**
- `microservidor:conexionEstablecida`
- `microservidor:eventoEntrante`
- `microservidor:errorConexion`

---

## Dependencias y relaciones

- Usa `dispositivos.json` para validar
- Depende del módulo `core` para reenviar eventos
- Se comunica indirectamente con `almacenamiento`

---

## Consideraciones

- Nunca expone interfaz pública
- Trabaja solo en red local
- Puede aceptar múltiples conexiones simultáneas
- No guarda estado, solo emite y recibe

