# Filosofía de Interacción: PizzePOS no es un POS

## Propósito

PizzePOS no busca parecerse a un sistema de punto de venta tradicional. Está diseñado desde cero como una herramienta **centrada en el camarero**, en su momento de trabajo, en su entorno táctil, móvil, y con alto tráfico de interacciones rápidas.

## Principios

### 1. Cero fricción cognitiva

- El camarero **no debería pensar** en cómo usar el sistema.
- Todas las decisiones son **visuales y táctiles**.
- El flujo siempre **avanza**, nunca pregunta “¿qué querés hacer ahora?”.

### 2. Las cuentas no se abren ni se cierran: se disparan

- Una cuenta **nace al pulsar “+”**
- Se selecciona el tipo: **mesa, barra, delivery, llevar**
- El sistema asigna automáticamente un espacio si es necesario
- **No se gestiona el estado manualmente**, el sistema lo hace solo

### 3. El sistema reacciona a eventos, no a pantallas

Cada acción del usuario es un **evento que cambia el estado**:
- `cuenta:creada`
- `producto:seleccionado`
- `cart:checkout`
- `print:requested`

Esto permite que todo el sistema funcione como una **coreografía entre módulos** que escuchan y responden.

### 4. Colores y formas en vez de texto

- Tipos de cuenta tienen **colores distintos**
- Estados como “en cocina” o “listo” se reflejan visualmente:
  - Borde brillante
  - Íconos animados
  - Fondo difuminado
- **No es necesario leer nada**: se ve de un vistazo

### 5. Densidad y velocidad

- Optimizado para **pantallas pequeñas** y operación con una mano
- **Tamaños de toque grandes**, separación visual entre zonas
- Se puede operar con **una sola pulsación por paso**
- **Nada está a más de 2 taps de distancia**

## Resultado deseado

Un camarero debería poder:

- Abrir una cuenta en 1 segundo
- Añadir productos sin pensar en “cómo funciona el sistema”
- Ver qué cuenta está en qué estado de un solo vistazo
- No preocuparse por errores: el sistema **le cubre la espalda**

## Ubicación en la arquitectura

Esta filosofía afecta directamente a:

- `core`: navegación, foco, modularidad
- `cuentas`: flujo de inicio y asignación de espacios
- `cart` + `products`: selección táctil sin fricción
- `printing`: respuestas instantáneas a acciones
- `ui`: colores, espaciado, animaciones suaves

## Frase clave

**PizzePOS no es un POS. Es el flujo de la pizzería en tus dedos.**
