# PizzePOS

Sistema modular para pizzerías, basado en eventos.  
Cada módulo está desacoplado y tiene su propia configuración y dependencias.

## Estructura

- `modulos/*` – módulos independientes (`corazon`, `productos`, etc.)
- `plantillas/` – estructuras base para generar nuevos módulos
- `documentos/` – documentación técnica

## Comandos comunes

```bash
yarn install       # instala todo
npx lerna bootstrap # vincula módulos entre sí
```

Cada módulo tiene su propio `package.json` y configuración interna.
