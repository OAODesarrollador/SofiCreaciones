# Guía de Configuración - La Parrilla (Versión Turso/SQLite)

Este proyecto ha sido migrado a **Turso (libSQL)** para usar una base de datos real y performante en el borde.

## 1. Configuración de Base de Datos (Turso)
1. Instala Turso CLI:
   - **Windows**: `winget install turso`
   - **Mac/Linux**: `curl -sSfL https://get.tur.so/install.sh | bash`
2. Login: `turso auth login`
3. Crea la base de datos: 
   ```bash
   turso db create la-parrilla
   ```
4. Obtén la URL y el Token:
   ```bash
   turso db show la-parrilla
   # Copia la URL (libsql://...)
   
   turso db tokens create la-parrilla
   # Copia el Token
   ```

## 2. Variables de Entorno
Crea o actualiza tu archivo `.env.local`:

```ini
TURSO_DATABASE_URL=libsql://tu-base.turso.io
TURSO_AUTH_TOKEN=tu-token-largo
ADMIN_PASSWORD=tu-contraseña-admin
NEXT_PUBLIC_SHEET_ID= (Ya no es necesario para datos, pero quizás quieras mantenerlo accesible)
```

## 3. Inicializar Datos (Migración y Seed)
Una vez configuradas las variables, ejecuta estos comandos en tu terminal para crear las tablas y cargar los datos de ejemplo:

1. Crear tablas:
   ```bash
   npx drizzle-kit push
   ```

2. Cargar datos de ejemplo:
   ```bash
   node scripts/seed.js
   ```

## 4. Despliegue en Vercel
1. Importa el proyecto en Vercel.
2. En "Environment Variables", agrega:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `ADMIN_PASSWORD`
3. Desplegar.

## 5. Panel de Administración
Accede a `/admin` en tu navegador.
- Usa la contraseña configurada en `ADMIN_PASSWORD`.
- Podrás activar/desactivar productos y cambiar precios al instante.
