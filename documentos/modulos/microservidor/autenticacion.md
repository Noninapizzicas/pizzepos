--- 
prompt: |
  Genera el archivo `autenticacion.ts` para el módulo `microservidor` de PizzePOS.
  Su función es validar si un dispositivo está autorizado a conectar, a partir de una lista ya cargada.
  Debe exponer funciones puras, validar con Zod, y emitir eventos si ocurre un acceso no válido.

---

# Archivo: `autenticacion.ts` – Módulo `microservidor`

Este archivo se encarga de **verificar que un dispositivo tenga permiso para emitir o recibir eventos** en el sistema.  
Utiliza una lista de dispositivos previamente cargada desde `dispositivos.json`.

---

## Estructura esperada

Ubicación:
```
modulos/microservidor/validacion/autenticacion.ts
```

---

## Funciones que debe exponer

- `esDispositivoAutorizado(id: string, llave: string): boolean`
- `cargarListaAutorizada(lista: Dispositivo[]): void`
- `getDispositivosAutorizados(): Dispositivo[]`

---

## Stack y convenciones

- **Lenguaje**: TypeScript
- **Validación**: Zod
- **Eventos**: WebSocket + EventBus
- **Formato de eventos**: `modulo:evento`, payload con contexto
- **Idioma del código**: Español (nombres y comentarios)
- **No accede a disco directamente** (solo memoria)
- **No tiene UI ni dependencias externas**

---

## Eventos emitidos

- `microservidor:dispositivoNoAutorizado`  
  > Cuando se intenta conectar un dispositivo no válido
- `core:errorDetectado`  
  > Si la estructura de dispositivos es inválida al cargarla

---

## Batería de preguntas y respuestas

### ¿De dónde proviene la lista de dispositivos?
De un archivo `dispositivos.json` cargado previamente por el módulo `almacenamiento`.

### ¿Debe este archivo hacer lectura directa de archivos?
No. Solo recibe la lista como parámetro y la cachea en memoria.

### ¿Qué pasa si el archivo de dispositivos tiene errores?
Debe emitir `core:errorDetectado` con detalle y rechazar la carga.

### ¿Valida solo si existe el dispositivo o también la llave?
Ambos. ID y llave deben coincidir. Además, debe verificar que esté activo.

### ¿Debe emitir eventos al detectar dispositivos no válidos?
Sí. Especialmente `microservidor:dispositivoNoAutorizado`.

### ¿Esta lógica puede ser usada por otros módulos?
Sí. Aunque está en `microservidor`, el `core` también podría aprovecharla.

### ¿Debe permitir actualizar la lista sin reiniciar?
Sí. Debe permitir reemplazar la lista con una nueva vía `cargarListaAutorizada`.

---

## Consideraciones extra

- Idealmente este módulo no tiene dependencia circular con ningún otro.
- Su estado puede ser testeado mediante sus funciones públicas.
- Debe manejar todo desde memoria: no persistir, no mutar la fuente original.

---

Este `.md` es suficiente para que cualquier IA o desarrollador pueda implementar el archivo correctamente y sin ambigüedad.
