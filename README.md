# PizzePOS

**PizzePOS** es un sistema modular, minimalista y ultrarrápido pensado para pizzerías, bares y entornos de venta directa. Basado en eventos, sin navegación clásica, y diseñado para funcionar sin fricción ni explicaciones.

## Filosofía

- No se navega: se reacciona.
- No se configura: se define por estructura.
- No se guarda: se exporta y se borra.

## Estructura del Proyecto

```
pizzepos/
├── config/                  # Configuración general del sistema (pizzepos.config.json)
├── modulos/                 # Cada módulo autónomo (ej: productos, cuentas, corazon)
│   └── corazon/             # Módulo core lógico del sistema
├── plantillas/              # Plantillas para generación de nuevos módulos
│   ├── plantilla-modulo.json
│   └── cuestionario-modulo.json
├── documentos/              # Documentación específica por módulo
│   └── modulo-corazon.json
```

## Plantillas

### `plantilla-modulo.json`
Define la estructura base que debe seguir cualquier módulo del sistema, incluyendo:

- Rutas
- Estructura de carpetas
- Eventos
- Stack tecnológico
- Convenciones de código

### `cuestionario-modulo.json`
Guía con preguntas clave para definir bien cada módulo, ideal para trabajar con IA o diseñar colaborativamente.

## Módulo `corazon`

El centro del sistema. Orquesta eventos, valida llaves de dispositivos, y mantiene el estado del sistema. No tiene interfaz visual.

---

## Cómo contribuir

1. Usá las plantillas para proponer nuevos módulos.
2. Respetá la estructura y los estándares definidos en `pizzepos.config.json`.
3. Todo el sistema se desarrolla y documenta en español.

---

**Estado:** fase inicial de diseño estructural  
**Autor:** colaboración humano + IA  
**Repositorio:** [github.com/Noninapizzicas/pizzepos](https://github.com/Noninapizzicas/pizzepos)
