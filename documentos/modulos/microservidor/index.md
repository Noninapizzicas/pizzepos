---
prompt: |
  Genera el archivo `index.ts` del módulo `microservidor` de PizzePOS.
  Este archivo es el punto de entrada del módulo. Debe importar la configuración, inicializar el WebSocket,
  emitir eventos de estado (`microservidor:listo`, `microservidor:errorConexion`) y lanzar el servidor
  de forma automática al ejecutarse. Todo bajo una estructura modular y desacoplada.

---

# Archivo: `index.ts` – Módulo `microservidor`

Este archivo es el **punto de entrada principal** del módulo `microservidor`.  
Orquesta la configuración e inicialización del WebSocket y del sistema de eventos.

---

## Rol y propósito

- Ejecuta el microservidor al correr `node index.ts`
- Valida configuración inicial
- Inicia el WebSocket (archivo `ws.ts`)
- Prepara el entorno de eventos
- Emite `microservidor:listo` al estar operativo

---

## Funciones esperadas

- Validar configuración (usando `config.ts` y `Zod`)
- Capturar errores críticos de arranque
- Emitir eventos de error si algo falla (`microservidor:errorConexion`)
- Mostrar logs informativos para desarrolladores

---

## Stack de tecnologías usadas

- Node.js (sin frameworks)
- Zod (validación)
- WebSocket nativo
- date-fns (solo si se necesita timestamp formateado)
- Sin frontend

---

## Eventos involucrados

**Emite:**
- `microservidor:listo` – indica que todo está activo
- `microservidor:errorConexion` – error durante arranque
- `core:errorDetectado` – error global grave

---

## Dependencias esperadas

- `config/config.ts` – configuración estructurada
- `servidor/ws.ts` – lógica del servidor WebSocket
- `validacion/autenticacion.ts` – validación de llaves
- `eventos/manejadorEventos.ts` – canalizador de eventos

---

## Consideraciones

- No debe guardar estado
- No debe conectarse directamente a `core`, solo emitir eventos
- Puede ser ejecutado de forma independiente
- Toda su lógica debe ser modular y desacoplada


