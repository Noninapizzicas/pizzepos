# Módulo Cuentas

## Propósito

Este módulo gestiona el sistema de **zonas de trabajo**, **cuentas activas**, y la interacción inicial con el usuario para seleccionar mesas, barra, delivery o para llevar. Es el **punto de entrada visual y táctil** del sistema. Sirve como puerta al flujo de venta.

## Enfoque de Interacción

PizzePOS **rompe con el modelo tradicional de POS**. Aquí las cuentas no se "gestionan", se **disparan como eventos**. El camarero no debe pensar en su estado, solo ver y tocar.  
El sistema guía con **colores, formas y velocidad**. Es más una coreografía visual que un software administrativo.

### Principios de UX aplicados

- Se selecciona el tipo de cuenta → el sistema asigna el espacio disponible automáticamente
- El estado del espacio es visual: color + icono
- No hay que cerrar cuentas manualmente → se finaliza el pedido y el sistema lo resuelve

## Alcance

- Visualización de zonas y espacios (mesas, barra, etc.)
- Creación de nuevas cuentas asociadas a espacios
- Recuperación de cuentas en curso
- Control visual de estados: libre, ocupada, cerrada
- Asociación a usuario, dispositivo y hora de inicio
- Comportamiento sin fricción, táctil y directo

## Arquitectura

- Módulo Vue3 + Pinia
- Comunicación WebSocket con el servidor central
- Eventos asincrónicos para sincronización y actualizaciones en tiempo real
- Persistencia en archivo JSON: `/data/cuentas.json`
- Configuración dinámica por `zonas.json`

## Tipos Dinámicos

```ts
type ZonaTrabajo = {
  id: string;
  nombre: string;
  tipo: 'mesa' | 'barra' | 'delivery' | 'llevar';
  color: string;
  icono?: string;
  orden: number;
  espacios: Espacio[];
};

type Espacio = {
  id: string;
  nombre: string;
  estado: 'libre' | 'ocupado' | 'cerrado';
  cuentaId?: string;
};

type Cuenta = {
  id: string;
  espacioId: string;
  zonaId: string;
  tipo: 'mesa' | 'barra' | 'delivery' | 'llevar';
  estado: 'abierta' | 'cerrada';
  horaInicio: string;
  horaCierre?: string;
  usuario: string;
  dispositivo: string;
};
```

## Flujo de Trabajo

1. El módulo carga zonas desde `zonas.json`
2. Escucha eventos de sincronización desde el servidor
3. Renderiza la vista general con estados por espacio
4. Al seleccionar un espacio libre, emite `cuenta:creada`
5. El servidor distribuye el evento, actualiza persistencia
6. El módulo recibe confirmación y redirige al flujo de productos

## Estados Visuales y Colores

- `libre`: gris claro
- `ocupado`: color activo del tipo (ej: azul para mesas)
- `cerrado`: fondo apagado o con candado
- Estados intermedios como "en cocina" pueden marcarse con:
  - animación de borde
  - íconos tipo reloj / campana
  - cambio de opacidad

## Eventos

- `cuenta:creada`
- `cuenta:actualizada`
- `cuenta:cerrada`
- `cuenta:seleccionada`
- `zona:sincronizada`
- `espacio:actualizado`

## Componentes UI

- `ZonaGrid.vue`: renderiza espacios de una zona
- `EspacioCard.vue`: tarjeta visual del estado del espacio
- `CuentasResumen.vue`: lista de cuentas activas
- `SelectorTipoCuenta.vue`: popup de selección de tipo

## Archivos Asociados

- `cuentas.json`: datos en curso
- `zonas.json`: configuración visual y lógica
- `cuentas-backup/`: respaldos automáticos
- `logs/cuentas.log`: historial de eventos

## Consideraciones Técnicas

- Evitar duplicación de cuentas por conflicto de sincronización
- Funciona offline y sincroniza al reconectar
- Optimizado para pantallas táctiles de 6 a 10 pulgadas
- Respeta permisos por tipo de cuenta si el usuario lo requiere

## Experiencia Deseada

> El camarero abre una cuenta con un solo tap.  
> Elige el tipo, ve el espacio, empieza el pedido.  
> Todo lo demás es automático.  
> **Así debe sentirse usar PizzePOS.**
