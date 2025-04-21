# PizzePOS - Módulo Almacenamiento
# api.ts

Este archivo será el punto de integración entre el frontend y el backend del módulo de almacenamiento. Su propósito es exponer las funciones necesarias para interactuar con los complementos desde el navegador o cualquier otro cliente del sistema.

---

## Ruta del archivo

```
modulos/almacenamiento/api.ts
```

---

## Rol del archivo

El archivo `api.ts` funciona como una capa de abstracción para las acciones relacionadas con complementos y datos JSON, como:

- Validar un archivo JSON contra la plantilla correspondiente.
- Guardar un archivo validado en la ruta destino del complemento.
- Descargar un archivo existente del sistema.
- Listar los complementos disponibles.
- Obtener la plantilla de un complemento.

Este archivo puede estar conectado a un backend vía HTTP, o funcionar como una capa de invocación directa a funciones locales si se trata de una arquitectura sin servidor.

---

## Requisitos del sistema

- Debe respetar el contrato definido por el `cargador.ts`.
- Debe emitir eventos a través de `eventBus`.
- Debe validar usando la lógica de los manejadores cargados dinámicamente.
- Debe manejar errores de forma estructurada.
- Debe trabajar con archivos `File`, blobs y JSONs desde frontend.

---

## Estilo y tecnologías

- TypeScript
- Compatible con ambientes de ejecución modernos (browser o local)
- Modular y desacoplado del DOM
- Integrado con eventos (`eventBus`)

---

## Check List para AI o programador

- [ ] Usa `cargadorComplementos` para todas las operaciones.
- [ ] Valida la existencia de un complemento antes de procesar.
- [ ] Usa `leerArchivo` para procesar archivos `File` del navegador.
- [ ] Expone funciones como: `validarArchivo`, `guardarArchivo`, `descargarArchivo`, `listarComplementos`, `verPlantilla`.
- [ ] Soporta manejo de errores con eventos tipo `core:errorDetectado`.
- [ ] No hace rendering, solo lógica.
- [ ] Permite ser mockeado fácilmente para tests.

