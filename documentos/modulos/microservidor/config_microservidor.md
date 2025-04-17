# microservidor/config/config.ts

## Prompt para IA
Diseña el archivo `config.ts` para el módulo `microservidor` de PizzePOS. Este archivo se encarga de:

- Cargar y exponer la configuración general del microservidor.
- Leer desde un archivo JSON llamado `config.json`.
- Validar la estructura con Zod.
- Proveer funciones para acceder a la configuración en memoria.
- Emitir eventos de error si la estructura del archivo no es válida.

Ten en cuenta que la filosofía del sistema es modular, sin navegación clásica, basado en eventos y con mínima persistencia. Todo debe validarse antes de usarse.

---

## Propósito del archivo
Este archivo maneja la carga inicial de configuración del microservidor desde un archivo plano y expone métodos seguros para acceder a sus propiedades desde otros componentes del sistema.

## Tecnologías y librerías
- `Zod`: para validación de esquema
- `fs/promises`: para lectura del archivo `config.json`
- `EventBus` global (asumido ya inicializado en `global.eventBus`)
- Sin framework frontend
- Sin persistencia más allá de la memoria RAM

## Entrada y salida
- **Entrada esperada**: Archivo `config.json` con datos como puerto del servidor, versión del sistema, etc.
- **Salida esperada**: Objeto `config` validado y accesible mediante funciones públicas.

## Funcionalidades necesarias
- Función `cargarConfig()` que lee y valida el archivo.
- Función `getConfig()` que devuelve la configuración actual.
- Validación estricta con Zod.
- Emisión de evento `core:errorDetectado` si el archivo está malformado o faltan campos.

## Esquema mínimo esperado del archivo config.json
```json
{
  "servidor": {
    "puerto": 8080
  },
  "version": "1.0.0"
}
```

## Eventos que debe emitir
- `core:errorDetectado`: Si ocurre un fallo de lectura o validación del archivo.
- `microservidor:configCargada`: Al cargar correctamente la configuración.

## Estilo y convenciones
- Código limpio, en español, sin abreviaturas.
- Comentarios explicativos en funciones clave.
- Modular y desacoplado.

---

## Contexto global
- Este archivo es parte del módulo `microservidor`.
- Se espera que se ejecute una sola vez al iniciar el servidor.
- Otros archivos que lo usan: `index.ts`, `ws.ts`, `autenticacion.ts`.


