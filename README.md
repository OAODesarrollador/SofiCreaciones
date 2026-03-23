# Rotiseria - E-commerce y administración para gastronomía

Aplicación web para gestionar el catálogo, ventas y pedidos de una rotisería/parrilla. Incluye catálogo público con carrito, checkout, pagos con Mercado Pago, y un panel de administración para productos, combos y pedidos.

## Funcionalidades principales

- Catálogo de productos y combos con imágenes y orden configurable.
- Carrito y checkout con métodos de entrega (retiro o envío).
- Pagos con Mercado Pago y actualización de estado vía webhook.
- Gestión de pedidos con estado y detalle de items.
- Panel de administración con login por contraseña.
- Configuración centralizada de WhatsApp y datos de negocio.
- Base de datos en Turso (libSQL) con Drizzle ORM.

## Stack técnico

- Next.js (App Router) y React.
- Turso/libSQL + Drizzle ORM.
- Mercado Pago (API de pagos).
- Utilidades de migración y seed en `scripts/` y archivos `.mjs`.

## Estructura del proyecto

- `src/app`: Rutas, páginas y API routes (admin, pagos, pedidos, etc.).
- `src/components`: UI y componentes de negocio.
- `src/lib`: Acceso a base de datos, catálogo, pedidos, WhatsApp, utilidades.
- `scripts`: Scripts de migración/seed hacia Turso.
- `public`: Assets estáticos (imágenes y SVG).

## Requisitos

- Node.js 18+.
- Cuenta y base de datos en Turso (para producción).
- Credenciales de Mercado Pago (para pagos reales).

## Instalación y desarrollo local

1. Instalar dependencias.

```bash
npm install
```

2. Crear el archivo de entorno local.

```bash
cp .env.example .env.local
```

3. Completar variables en `.env.local`.

4. Ejecutar el entorno de desarrollo.

```bash
npm run dev
```

La app corre en `http://localhost:3000`.

## Variables de entorno

Definidas en `.env.example`:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `ADMIN_PASSWORD`
- `MP_ACCESS_TOKEN`
- `MP_WEBHOOK_SECRET`
- `FRONTEND_URL`
- `BACKEND_URL`
- `NEXT_PUBLIC_MP_PUBLIC_KEY`
- `NEXT_PUBLIC_SHEET_ID` (opcional)
- `NEXT_PUBLIC_GID_PRODUCTS` (opcional)
- `NEXT_PUBLIC_GID_COMBOS` (opcional)
- `NEXT_PUBLIC_GID_CONFIG` (opcional)

## Base de datos y datos de catálogo

- La app usa Turso/libSQL como base de datos principal.
- El catálogo y la configuración se leen desde la base mediante `src/lib/catalog.js`.
- Para desarrollo local, puede usarse `file:local.db` como fallback si no hay variables de Turso.

Scripts útiles:

- `scripts/seed.mjs`: carga inicial de datos.
- `scripts/migrate-to-turso.mjs`: migraciones hacia Turso.
- `apply-local-sql-to-turso.mjs` y `export_localdb_to_sql.py`: utilidades de transferencia.

## Pagos con Mercado Pago

- Endpoint de creación: `src/app/api/payments/mp/create/route.js`.
- Webhook: `src/app/api/payments/mp/webhook/route.js`.
- El webhook requiere `BACKEND_URL` público para recibir notificaciones.

## Administración

- Login por contraseña usando `ADMIN_PASSWORD`.
- Rutas en `src/app/admin` y APIs en `src/app/api/admin`.

## Deploy

Despliegue recomendado en Vercel.

1. Configurar variables de entorno en Vercel.
2. Desplegar desde el branch `main`.

## Documentación adicional

- `SETUP_GUIDE.md`: guía de configuración.
- `ADMIN_ACCESS_GUIDE.md`: acceso y uso del panel admin.
- `DATABASE_UPDATE_MODULES.md`: notas sobre actualización de módulos de DB.
