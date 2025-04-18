# almacenamiento.md

## Prompt para IA
Diseña el módulo `almacenamiento` de PizzePOS para manejar de forma robusta y extensible la carga y validación de archivos JSON de configuración y datos. Este módulo:

- Permite subir archivos como `productos.json`, `variaciones.json`, `salsas.json`, etc.
- Cada archivo tiene un complemento asociado (validador + plantilla + lógica visual).
- La estructura del módulo debe permitir extender con nuevos complementos fácilmente.

---

## Propósito del módulo
Centralizar el manejo de archivos externos que configuran el sistema. Este módulo sirve como "puerta de entrada" para datos estructurados, que definen el comportamiento del resto del ecosistema PizzePOS.

## Filosofía aplicada
- Modularidad: cada tipo de archivo (productos, cuentas, etc.) se maneja como un "complemento" independiente.
- Simplicidad de uso: un solo archivo define la lógica completa del complemento.
- Flexibilidad: nuevos complementos se integran sin modificar el núcleo del módulo.

## Terminología
- **Complemento**: archivo `.ts` que maneja validación, plantilla y visualización de un tipo específico de archivo.
- **Archivo externo**: JSON cargado por el usuario, que contiene datos como productos, configuraciones, etc.
- **Plantilla**: JSON base que sirve como guía para construir un archivo válido.

---

## Estructura esperada del módulo

```
modulos/almacenamiento/
├── index.ts                    # Entrada del módulo
├── complementos/
│   ├── productos.ts
│   ├── variaciones.ts
│   └── salsas.ts
├── utils/
│   └── validadores.ts
└── ui/
    ├── SelectorComplemento.vue
    ├── FormularioSubida.vue
    └── ResumenEstado.vue
```

## Tecnología sugerida
- `Zod`: validación de estructura de archivos JSON.
- `Vue 3` + `Vite`: para UI del sistema de carga.
- `FileReader API`: para leer archivos locales.
- `EventBus`: comunicación entre complementos y sistema central.

## Funcionalidades clave
- Visualizar complementos disponibles.
- Subir archivo desde UI.
- Validar automáticamente el contenido.
- Mostrar errores y éxito.
- Emitir eventos (`almacenamiento:archivoCargado`, `almacenamiento:errorValidacion`).
- Permitir reemplazo o eliminación de archivos previamente cargados.
- Cargar automáticamente archivos desde disco local si están presentes.

## Extensión con nuevos complementos
Cada nuevo tipo de archivo (por ejemplo `cuentas.json`) debe incluir:
- Un archivo `cuentas.ts` en `/complementos`
- Un esquema Zod
- Un ejemplo o plantilla
- Registro en `index.ts` como tipo reconocido

## Seguridad
- Los archivos nunca se almacenan fuera de memoria (a menos que el complemento lo haga explícitamente).
- Toda validación es local.
- El sistema no persiste datos automáticamente.

## Módulos relacionados
- `core`: puede escuchar eventos de éxito/error de carga.
- `productos`, `carrito`, etc.: consumen archivos cargados aquí.
