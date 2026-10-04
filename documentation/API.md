# API REST de ShopChain

Base: `http://localhost:8080/shopchain/api`.

## Autenticación

1. `GET /auth/csrf`: devuelve `headerName` y `token`, y crea la sesión.
2. `POST /auth/login`: enviar formulario `application/x-www-form-urlencoded` con `identifier` y `password`, la cookie de sesión y la cabecera `X-CSRF-TOKEN`.
3. Solicitar nuevamente `GET /auth/csrf` después del login: Spring renueva el token al autenticar.
4. Conservar la cookie `JSESSIONID` en todas las llamadas. Enviar el token en las escrituras.
5. `GET /auth/me`: usuario de la sesión actual.
6. `POST /auth/logout`: requiere CSRF; invalida la sesión y devuelve `204`.

El login devuelve el usuario, nunca su contraseña. Una sesión expira después de 30 minutos de inactividad. Como se utiliza la sesión estándar de Spring Security, los cambios de rol, correo, contraseña o estado de un usuario se aplican a su autenticación al volver a iniciar sesión.

### Ejemplo en PowerShell

```powershell
$base = 'http://localhost:8080/shopchain/api'
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$csrf = Invoke-RestMethod "$base/auth/csrf" -WebSession $session
$headers = @{ 'X-CSRF-TOKEN' = $csrf.token }

Invoke-RestMethod "$base/auth/login" -Method Post -WebSession $session -Headers $headers `
  -ContentType 'application/x-www-form-urlencoded' `
  -Body @{ identifier = 'admin@shopchain.pe'; password = 'admin123' }

$csrf = Invoke-RestMethod "$base/auth/csrf" -WebSession $session
$headers = @{ 'X-CSRF-TOKEN' = $csrf.token }
$products = Invoke-RestMethod "$base/products" -WebSession $session
$branches = Invoke-RestMethod "$base/branches" -WebSession $session

$body = @{
  customer = 'Ana Torres'
  customerDocument = '12345678'
  branchId = $branches[0].id
  observations = 'Retiro en tienda'
  items = @(@{ productId = $products[0].id; quantity = 1; size = 40 })
} | ConvertTo-Json -Depth 4

$order = Invoke-RestMethod "$base/orders" -Method Post -WebSession $session -Headers $headers `
  -ContentType 'application/json; charset=utf-8' -Body $body
$order

Invoke-RestMethod "$base/auth/logout" -Method Post -WebSession $session -Headers $headers
```

## Rutas

Todas las rutas de negocio requieren sesión. Los listados devuelven arrays JSON.

| Método | Ruta | Función |
|---|---|---|
| GET | `/users`, `/users/{id}` | Listar o consultar usuarios |
| POST | `/users` | Crear usuario |
| PUT | `/users/{id}` | Editar datos, rol, contraseña o estado |
| GET | `/categories` | Listar categorías |
| POST | `/categories` | Crear categoría |
| GET | `/products`, `/products/{id}` | Listar o consultar productos |
| POST | `/products` | Crear producto |
| PUT | `/products/{id}` | Editar producto, incluyendo `active` |
| GET | `/branches`, `/branches/{id}` | Listar o consultar sucursales |
| POST | `/branches` | Crear sucursal |
| PUT | `/branches/{id}` | Editar sucursal, incluyendo `active` |
| GET | `/inventory` | Consultar stock |
| POST | `/inventory` | Registrar producto/sucursal con stock cero |
| GET | `/stock-movements` | Consultar movimientos, del más reciente al más antiguo |
| POST | `/stock-movements` | Registrar entrada, salida o reposición |
| GET | `/orders`, `/orders/{id}` | Listar o consultar pedidos |
| POST | `/orders` | Crear pedido y descontar stock |
| PATCH | `/orders/{id}/status` | Cambiar estado |
| GET | `/dashboard/metrics` | Métricas generales |
| GET | `/dashboard/branches` | Porcentaje del stock total por sucursal |
| GET | `/dashboard/activity` | Últimos diez movimientos |

### Permisos

| Operación | Roles permitidos |
|---|---|
| Consultar usuarios y escribir usuarios, productos, categorías o sucursales | `ADMINISTRADOR` |
| Registrar inventario y movimientos manuales | `ADMINISTRADOR`, `ALMACÉN` |
| Crear pedidos | `ADMINISTRADOR`, `TIENDA` |
| Cambiar estado de pedidos y consultar los demás módulos | Los tres roles |

### Filtros opcionales

- `/products?search=nike&categoryId=1&active=true`
- `/inventory?productId=1&branchId=1&status=Stock%20bajo`
- `/stock-movements?productId=1&branchId=1`
- `/orders?branchId=1&status=Pendiente`

Los valores de estado de inventario son `Disponible`, `Stock bajo` y `Sin stock`. Los artículos agotados se consultan con `Sin stock`; las sugerencias de reposición pueden usar esos resultados junto con `Stock bajo`.

## Cuerpos de solicitud

Los ejemplos usan IDs ilustrativos: consultar primero los listados. Los IDs, fechas, responsables, precios de pedido y totales de respuesta los determina el servidor. Las propiedades desconocidas se rechazan.

### Usuario

```json
{
  "names": "Ana Torres",
  "email": "ana@shopchain.pe",
  "password": "password123",
  "role": "TIENDA",
  "active": true
}
```

`password` es obligatorio al crear; omitirlo en una actualización conserva la contraseña actual. Mínimo ocho caracteres y máximo 72 bytes UTF-8. Roles: `ADMINISTRADOR`, `ALMACÉN`, `TIENDA`. El correo se guarda en minúsculas y es único.

### Categoría

```json
{ "name": "Training" }
```

### Producto

```json
{
  "sku": "NK-TEST-001",
  "name": "Zapatilla deportiva",
  "brand": "Nike",
  "categoryId": 1,
  "price": 199.90,
  "description": "Calzado para entrenamiento",
  "image": "",
  "active": true
}
```

La respuesta incluye `id`, `categoryId` y `category` (nombre). El SKU se guarda en mayúsculas y es único. Los importes admiten dos decimales.

### Sucursal

```json
{ "name": "Surco", "address": "Av. Benavides 1000", "location": "Lima", "active": true }
```

Los `PUT` envían todos los campos editables del recurso. Para desactivar productos, sucursales o usuarios, enviar `active: false`; se conservan sus relaciones e historial.

### Registro de inventario

```json
{ "productId": 1, "branchId": 1, "minimumStock": 3 }
```

Solo puede existir una fila por producto y sucursal. Luego se cargan existencias mediante movimientos.

### Movimiento

```json
{
  "productId": 1,
  "branchId": 1,
  "type": "ENTRADA",
  "quantity": 10,
  "reference": "GUIA-001",
  "observation": "Compra a proveedor"
}
```

Tipos: `ENTRADA`, `SALIDA`, `REPOSICIÓN`. La cantidad enviada siempre es positiva. En las respuestas, una salida tiene cantidad negativa, compatible con la representación del frontend. El responsable es el correo del usuario autenticado. El inventario debe existir y tanto producto como sucursal deben estar activos.

### Pedido

```json
{
  "customer": "Ana Torres",
  "customerDocument": "12345678",
  "branchId": 1,
  "observations": "Retiro presencial",
  "items": [{ "productId": 1, "quantity": 2, "size": 40 }]
}
```

La talla es opcional. Se descuentan existencias y se registra una salida por cada detalle. Si algún producto no tiene stock suficiente, se revierte todo el pedido y sus movimientos. Los nombres, precios, subtotales y el total se calculan en el backend.

### Cambio de estado

```json
{ "status": "En preparación" }
```

Secuencia: `Pendiente → En preparación → Listo para retiro → Completado`. `Cancelado` es válido desde cualquier estado previo a completar. Repetir el estado actual no vuelve a generar movimientos.

## Respuestas y errores

- `200`: consulta o actualización correcta.
- `201`: recurso creado.
- `204`: logout correcto.
- `400`: validación, formato o valor de parámetro inválido.
- `401`: sesión ausente, credenciales incorrectas o usuario inactivo al autenticar.
- `403`: rol sin permiso o CSRF inválido.
- `404`: recurso inexistente.
- `409`: datos duplicados o regla de negocio incumplida, por ejemplo stock insuficiente.

Los errores contienen `status` y `detail`. Los errores de validación también incluyen un objeto `fields` con los mensajes por campo.

## Contrato de integración Angular

- Mantener la URL base existente y usar `withCredentials: true`.
- Obtener `/auth/csrf` y enviar la cabecera indicada en cada escritura, también en login y logout.
- El login devuelve un usuario; el servicio Angular podrá transformarlo a su resultado actual `boolean`.
- Las relaciones en solicitudes usan `categoryId`, `productId` y `branchId`. Las respuestas incluyen los nombres para mostrar en pantalla.
- Las fechas se devuelven en ISO-8601 UTC, para formatearlas en Angular.
- Los estados y roles conservan los textos en español definidos en los modelos de Angular.
- Consultar stock por producto con `/inventory?productId=...`; la respuesta contiene `branch` y `stock`, además de los datos del inventario.
- La API no utiliza los IDs, fechas, totales ni responsables generados por los mocks del navegador.
