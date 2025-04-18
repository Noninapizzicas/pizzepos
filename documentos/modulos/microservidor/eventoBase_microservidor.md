# microservidor/utils/helpers.ts – función `crearEventoBase`

## Prompt para IA
Crea una función TypeScript `crearEventoBase()` para el módulo `microservidor` del sistema PizzePOS. Esta función debe generar la estructura base de cualquier evento emitido por el sistema. El evento debe cumplir con las convenciones globales del sistema y usarse como plantilla por otros módulos para emitir eventos estandarizados.

---

## Propósito
Facilita la creación de eventos consistentes a nivel estructural y semántico, asegurando coherencia en todo el sistema.

---

## Entrada y salida
- **Entrada**:
  - `tipo`: cadena con el nombre del evento (ej: `core:errorDetectado`).
  - `payload`: objeto con la información del evento (puede ser parcial).
- **Salida**:
  - Objeto evento completo con:
    - `meta`: id, timestamp, tipo, origen, prioridad.
    - `payload`: los datos proporcionados.
    - `contexto`: siempre indica el módulo `microservidor`.

---

## Convenciones a cumplir
- El campo `meta.id` debe generarse con `crypto.randomUUID()`.
- El campo `meta.timestamp` debe usar `new Date().toISOString()`.
- El campo `meta.origen` debe ser siempre `'microservidor'`.
- El campo `meta.prioridad` debe ser `5` por defecto (ajustable).
- `contexto.dispositivoId` debe ser `'microservidor'`.

---

## Estilo y tecnologías
- Código en español
- Tipado estricto
- Comentarios explicativos
- Estilo consistente con el resto del módulo
- Tecnologías: TypeScript, API nativa `crypto`, `Date`

---

## Filosofía aplicada
- Eventos primero
- Modularidad
- Expresividad en español
- Estandarización sin rigidez

---

## Consideraciones adicionales
- Este helper debe importarse en todos los archivos que emitan eventos.
- Es preferible que sea una función pura.
- Puede evolucionar para incluir validación si se integra con Zod en el futuro.

