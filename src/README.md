# Estructura de `src`

Esta carpeta queda organizada por responsabilidad:

- `routes/`: definicion central de rutas de la app.
- `pages/`: pantallas completas por modulo (`Auth`, `Admin` y `Usuario`).
- `components/`: piezas reutilizables separadas por dominio.
- `hooks/`: logica reusable de React y acceso a datos.
- `services/`: clientes y servicios externos, como Supabase y autenticacion.
- `utils/`: helpers puros agrupados por intencion (`auth`, `errors`, `notifications` y `storage`).
- `theme/`: variables globales de Ionic/CSS.

Cada seccion principal tiene un `index.ts` para importar desde una entrada clara.
