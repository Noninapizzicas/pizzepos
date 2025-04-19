
# complementos.md

## Prompt para IA
Genera un sistema de complementos para el módulo `almacenamiento` en PizzePOS, basado en un diseño modular y extensible. Cada complemento es un archivo `.ts` que actúa como intérprete lógico de un archivo `.json`, permitiendo acciones como validación, generación de formularios, y procesamiento de datos.

Este sistema debe:
- Detectar automáticamente qué complementos están disponibles en el sistema.
- Cargar un archivo JSON relacionado a cada complemento.
- Usar lógica específica en cada `.ts` para interpretar y accionar.
- Mostrar formularios contextuales o botones de acción según el tipo de complemento.
- Ser reutilizable en otros módulos como `productos` o `flujoPedidos`.

---

## Propósito del sistema
Permitir al módulo `almacenamiento` manejar de forma unificada pero flexible múltiples tipos de datos estructurados (`productos`, `variaciones`, `config`, etc.), cada uno con lógica, validaciones y plantillas específicas, encapsuladas en archivos individuales.

---

## Preguntas clave y respuestas

### 1. ¿Qué es un complemento?
Un archivo `.ts` que define la lógica específica para interpretar un archivo `.json`. Puede validar, generar formularios, ofrecer plantillas o ejecutar acciones.

### 2. ¿Dónde se ubican?
En `modulos/almacenamiento/complementos/`. Cada uno tiene un nombre representativo (`productos.ts`, `variaciones.ts`, etc.).

### 3. ¿Qué archivos necesita cada complemento?
- Su `json` de datos, en `data/<tipo>.json`.
- Su plantilla en `plantillas/<tipo>.plantilla.json`.
- Su validador/interprete `.ts` en `complementos/<tipo>.ts`.

### 4. ¿Cómo los visualiza el usuario?
Desde una interfaz del módulo `almacenamiento` que lista automáticamente los complementos disponibles y permite:
- Ver plantilla.
- Cargar archivo.
- Validar y guardar.

### 5. ¿Cuándo se cargan?
La interfaz se carga solo si se accede manualmente desde la ruta `config.rutas.almacenamiento` usando un dispositivo validado.

### 6. ¿Qué lógica hay en los .ts?
Cada archivo `.ts`:
- Expone una función pública como `procesarDatos(json)` o `validar()`.
- Lee la plantilla, valida el archivo y emite eventos si es necesario.

### 7. ¿Se puede extender?
Sí. Otros módulos pueden usar este mismo sistema de complementos (con otro propósito) para botones contextuales, menús dinámicos, lógica desacoplada, etc.

---

## Estructura de carpetas
```
modulos/
└── almacenamiento/
    ├── complementos/
    │   ├── productos.ts
    │   ├── variaciones.ts
    │   └── ...
    ├── data/
    │   ├── productos.json
    │   ├── variaciones.json
    ├── plantillas/
    │   ├── productos.plantilla.json
    │   ├── variaciones.plantilla.json
```

---

## Estilo, filosofía y convenciones

- Todo el sistema funciona sin rutas navegables ni menús tradicionales.
- Las interfaces se generan desde lógica y datos, no desde navegación.
- La visualización siempre parte del evento o intención del usuario.
- Un único archivo `.ts` puede contener toda la lógica, manteniendo alta modularidad y reutilización.
- La interfaz debe ser mínima pero clara.

---

## Inspiración

Este sistema se inspira en la filosofía de PizzePOS:
> "Cada módulo es independiente, pero todos comparten una arquitectura común basada en eventos y configuración declarativa. La modularidad no es solo estructural, es funcional."

---

## Futuras posibilidades

- Uso de IA para generar archivos `.json` basados en plantillas.
- Previsualización visual en tiempo real antes de guardar.
- Complementos autoactualizables desde un repositorio de plantillas remoto.

