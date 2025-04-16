# Módulo `corazon` – PizzePOS

Este módulo representa el núcleo lógico del sistema. No tiene interfaz, solo lógica y control.

## Funciones clave

- Escucha y distribuye eventos
- Valida llaves de dispositivos
- Mantiene estado compartido en memoria
- Carga configuración y archivos clave
- Opera de forma desacoplada

## Estructura

- `index.ts` – punto de entrada
- `config/` – configuración del sistema
- `estado/` – estado global y dispositivos
- `eventos/` – recepción y distribución de eventos
- `validacion/` – verificación de llaves
- `utils/` – funciones auxiliares

## Stack

- TypeScript
- Zod
- date-fns
- Dinero.js
- EventBus personalizado

## Arranque

```bash
npm install
npm run start
```

Este módulo es autónomo pero esencial. Otros módulos dependen de él para funcionar correctamente.
