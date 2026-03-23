# Módulos de Actualización de Base de Datos - La Parrilla

## 📋 Descripción General

Este conjunto de módulos permite gestionar y actualizar completamente los productos de la base de datos, incluyendo:
- Crear nuevos productos
- Actualizar precios, descripciones, imágenes y otros datos
- Eliminar productos
- Filtrar y buscar productos
- Control de disponibilidad

## 📁 Archivos Nuevos/Modificados

### Funciones principales (`src/lib/catalog.js`)
- `fetchAllProducts()` - Obtener todos los productos (incluyendo no disponibles)
- `createProduct(data)` - Crear nuevo producto con validación
- `updateProduct(id, data)` - Actualizar producto existente
- `deleteProduct(id)` - Eliminar producto
- `getProductById(id)` - Obtener un producto específico

### API Routes (`src/app/api/admin/products/route.js`)
- **GET** `/api/admin/products` - Listar todos los productos
- **POST** `/api/admin/products` - Crear nuevo producto
- **PATCH** `/api/admin/products` - Actualizar producto
- **DELETE** `/api/admin/products?id=<id>` - Eliminar producto

### Validadores (`src/lib/validators.js`)
- `productValidators.validateProduct(data)` - Validar producto completo
- `productValidators.validateProductUpdate(data)` - Validar actualización parcial

### Componentes UI
- `ProductEditor.js` - Formulario para crear/editar productos
- `AdminProductList.js` - Página de gestión completa de productos

## 🔧 Estructura de Datos - Producto

```javascript
{
  id: number,           // Auto-generado por BD
  nombre: string,       // Requerido
  descripcion: string,  // Opcional
  precio: number,       // Requerido, en centavos (ej: 1500 = $15.00)
  categoria: string,    // Requerido (ej: "LA PARRILLA", "COMBOS")
  imagen: string,       // Opcional, ruta a imagen
  disponible: boolean,  // Por defecto true
  orden: number         // Orden de presentación (menor = primero)
}
```

## 🚀 Ejemplos de Uso

### Crear Producto

```javascript
// Desde cliente
const response = await fetch('/api/admin/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Asado Completo',
    descripcion: 'Asado de tira con chimichurri casero',
    precio: 2500,  // $25.00
    categoria: 'LA PARRILLA',
    imagen: '/images/asado.jpg',
    disponible: true,
    orden: 1
  })
});

const data = await response.json();
// { success: true, id: 42 }
```

### Actualizar Producto

```javascript
const response = await fetch('/api/admin/products', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 42,
    precio: 2800,
    descripcion: 'Actualizado con chorizo incluido'
  })
});

const data = await response.json();
// { success: true }
```

### Obtener Todos los Productos

```javascript
const response = await fetch('/api/admin/products');
const data = await response.json();
// { success: true, data: [...products] }
```

### Eliminar Producto

```javascript
const response = await fetch('/api/admin/products?id=42', {
  method: 'DELETE'
});

const data = await response.json();
// { success: true }
```

## 🔐 Seguridad

Todas las rutas API requieren autenticación mediante cookie `admin_token`. Asegúrate de:
1. Iniciar sesión en `/admin`
2. Verificar que la cookie `admin_token` esté presente
3. Implementar logout que limpie la cookie

## ✅ Validaciones

### Producto Nuevo
- **nombre**: Requerido, max 100 caracteres
- **precio**: Requerido, número >= 0
- **categoria**: Requerido

### Actualización Parcial
- Todos los campos son opcionales
- Las mismas validaciones aplican si se incluyen

## 🎨 Componente ProductEditor

Uso directo en componentes:

```javascript
import ProductEditor from '@/components/business/ProductEditor';

export default function MyComponent() {
  const [product, setProduct] = useState(null);

  return (
    <ProductEditor
      product={product}  // null para crear, objeto para editar
      onSave={() => {
        // Refrescar lista, cerrar modal, etc.
      }}
      onCancel={() => {
        // Cerrar editor
      }}
    />
  );
}
```

## 📋 Página Admin Completa

Disponible en `/admin/dashboard`:
- Tabla de productos con búsqueda
- Filtrado por categoría
- Botones para editar/eliminar
- Formulario integrado para crear/editar
- Indicadores visuales de disponibilidad

## 🐛 Manejo de Errores

Las APIs devuelven:
- **200-201**: Éxito
- **400**: Error de validación (campo `error` con detalle)
- **401**: No autenticado
- **500**: Error del servidor

Ejemplo:
```javascript
if (!response.ok) {
  const errorData = await response.json();
  console.error('Error:', errorData.error);
}
```

## 🔄 Flujo Recomendado

1. Usuario va a `/admin/dashboard`
2. Se cargan productos automáticamente
3. Puede buscar/filtrar productos
4. Click en "Crear" → Abre formulario vacío
5. Click en "✏️" → Carga producto en formulario
6. Cambios se guardan con validación automática
7. Click en "🗑️" → Confirma y elimina

## 📝 Notas

- Los precios se almacenan en centavos en BD (multiplica por 100)
- Las imágenes deben estar en `/public` o ser URLs externas
- El orden es ascendente (1 es primero)
- Los productos con `disponible: false` no aparecen en tienda pero sí en admin
