# API REST de ShopChain

Base: `http://localhost:8080/shopchain/api`.

## OpenAPI y Swagger UI

- Interfaz Swagger: `GET /api/docs` → http://localhost:8080/shopchain/api/docs.
- Especificación: `GET /api/openapi.yml` → http://localhost:8080/shopchain/api/openapi.yml.
- Fuente del contrato: `src/main/resources/openapi.yml`. Actualizarlo cuando cambien las rutas o los DTO.

Ambos endpoints son públicos. Swagger se sirve desde el backend, incluidos sus
archivos JavaScript y CSS. Las URLs se resuelven respecto a la instancia actual.

En **Autenticación → POST /auth/login → Try it out**, introducir el correo en
`identifier` y la contraseña en el cuerpo JSON, y pulsar **Execute**. Copiar
`accessToken` de la respuesta y pegarlo en **Authorize**, sin el prefijo `Bearer`.
Swagger enviará la cabecera `Authorization` en las operaciones protegidas.
Después del login, probar `GET /auth/me` y las operaciones de negocio. Para dejar
de enviar el token, pulsar **Logout** dentro de **Authorize**.

## Autenticación

1. `POST /auth/login`: enviar `application/json` con `identifier` (correo) y `password`.
2. La respuesta incluye `accessToken`, `tokenType: "Bearer"`, `expiresIn` (segundos) y `user`, nunca su contraseña.
3. Enviar `Authorization: Bearer <accessToken>` en todas las llamadas protegidas, tanto lecturas como escrituras.
4. `GET /auth/me`: devuelve los datos actuales del usuario identificado por el token.
5. Cerrar sesión consiste en eliminar el token del cliente. No hay endpoints `/auth/csrf` ni `/auth/logout`.

Ejemplo de solicitud:

```json
{ "identifier": "admin@shopchain.pe", "password": "admin123" }
```

Ejemplo de respuesta (token abreviado):

```json
{
  "accessToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 1800,
  "user": {
    "id": 1,
    "names": "Administrador",
    "email": "admin@shopchain.pe",
    "role": "ADMINISTRADOR",
    "active": true
  }
}
```

La API no usa sesiones HTTP ni cookies de autenticación. Los JWT se firman con HS256
y vencen a los 30 minutos de su emisión por defecto (`JWT_EXPIRATION_MINUTES`). No hay
renovación automática ni refresh tokens. Ante `401`, iniciar sesión nuevamente.
La clave se configura con `JWT_SECRET` (mínimo 32 bytes UTF-8); solo el perfil `dev`
incluye una clave de demostración. Fuera de desarrollo se debe proporcionar una clave
secreta aleatoria mediante esa variable de entorno.

Esta implementación sencilla no revoca tokens: borrar el token en el cliente no
invalida otras copias. Los permisos del JWT se mantienen hasta que venza, incluso
si se cambia el rol, correo, contraseña o estado del usuario. Un nuevo login usa los
datos actualizados; un usuario inactivo no puede obtener nuevos tokens.

### Ejemplo en PowerShell

```powershell
$base = 'http://localhost:8080/shopchain/api'
$credentials = @{ identifier = 'admin@shopchain.pe'; password = 'admin123' } | ConvertTo-Json
$login = Invoke-RestMethod "$base/auth/login" -Method Post `
  -ContentType 'application/json' -Body $credentials
$headers = @{ Authorization = "Bearer $($login.accessToken)" }
$products = Invoke-RestMethod "$base/products" -Headers $headers
$branches = Invoke-RestMethod "$base/branches" -Headers $headers

$body = @{
  customer = 'Ana Torres'
  customerDocument = '12345678'
  branchId = $branches[0].id
  observations = 'Retiro en tienda'
  items = @(@{ productId = $products[0].id; quantity = 1; size = 40 })
} | ConvertTo-Json -Depth 4

$order = Invoke-RestMethod "$base/orders" -Method Post -Headers $headers `
  -ContentType 'application/json; charset=utf-8' -Body $body
$order

# Cierre local: dejar de conservar y enviar el token.
$login = $null
$headers = $null
```

## Rutas

Todas las rutas de negocio requieren un JWT válido. Los listados devuelven arrays JSON.

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
- `400`: validación, formato o valor de parámetro inválido.
- `401`: JWT ausente, inválido o vencido; credenciales incorrectas o usuario inactivo al autenticar.
- `403`: rol sin permiso para la operación.
- `404`: recurso inexistente.
- `409`: datos duplicados o regla de negocio incumplida, por ejemplo stock insuficiente.

Los errores contienen `status` y `detail`. Los errores de validación también incluyen un objeto `fields` con los mensajes por campo.

## Contrato de integración Angular

- Mantener la URL base existente; no se necesita `withCredentials`.
- Guardar `accessToken` en `sessionStorage` y añadir `Authorization: Bearer <token>` mediante el interceptor, únicamente para la API.
- El login devuelve el token y el usuario; `AuthService.login()` conserva su resultado `boolean` para la pantalla.
- Restaurar el usuario con `/auth/me` solo cuando exista un token guardado. Un `401` limpia el token y solicita iniciar sesión.
- Logout es local: eliminar el token y el usuario actual. `sessionStorage` sobrevive a recargas, queda limitado a la pestaña y es accesible desde JavaScript.
- Las relaciones en solicitudes usan `categoryId`, `productId` y `branchId`. Las respuestas incluyen los nombres para mostrar en pantalla.
- Las fechas se devuelven en ISO-8601 UTC, para formatearlas en Angular.
- Los estados y roles conservan los textos en español definidos en los modelos de Angular.
- Consultar stock por producto con `/inventory?productId=...`; la respuesta contiene `branch` y `stock`, además de los datos del inventario.
- La API no utiliza los IDs, fechas, totales ni responsables generados por los mocks del navegador.
