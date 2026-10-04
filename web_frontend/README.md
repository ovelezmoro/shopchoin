# ShopChain — Frontend Angular

## Características

- Autenticación con sesión HTTP del backend, cookies, CSRF y rutas protegidas mediante un guard.
- Panel principal con métricas, stock por sucursal y actividad reciente.
- Catálogo con búsqueda, filtros, disponibilidad y detalle de stock por sucursal.
- Gestión de pedidos con listado, creación, detalle y seguimiento por estados.
- Inventario consultable por producto y sucursal, con filtros por sede y estado.
- Registro de entradas, salidas y reposiciones de stock.
- Sugerencias de reposición para artículos con stock bajo o agotado.
- Administración de productos, sucursales y usuarios con formularios reactivos.
- Gestión de roles y estado de acceso de usuarios.
- Diseño adaptable para escritorio y pantallas pequeñas.
- Componentes standalone y páginas con carga diferida mediante Angular Router.

Los datos se consultan y guardan en el backend. Al recargar, la sesión se recupera mediante `/auth/me`.

Interfaz independiente para la plataforma de inventarios y logística de calzado deportivo. Usa servicios Angular con `HttpClient` y `Observable`.

## Requisitos

- Node.js 20.19 o 22.12 (o superior compatible con Angular 20)
- npm 10 o superior

## Instalación y ejecución

Primero ejecutar `mvn spring-boot:run` desde la raíz del repositorio. En otra terminal:

```bash
cd web_frontend
npm install
npm start
```

URL: <http://localhost:4200>

Credenciales iniciales de desarrollo: `admin@shopchain.pe` / `admin123` (si no se cambió la contraseña de demostración).

## Estructura

- `src/app/core/models`: modelos de respuesta y solicitudes de formularios.
- `src/app/core/services`: llamadas HTTP por módulo, sesión, CSRF y mensajes de error.
- `src/app/core/interceptors`: cookies y CSRF para la API; errores de negocio y estado de guardado compartido.
- `src/app/core/guards`: validación de sesión y roles.
- `src/app/shared`: layout reutilizable.
- `src/app/features`: `auth`, `home`, `catalog`, `orders`, `inventory` y `administration`.
- `src/environments`: URL base de la API.

## Flujo de inventario y pedidos

1. Crear el producto en Administración, seleccionando una categoría de la API.
2. En Inventario, registrar producto, sucursal y stock mínimo. Comienza con stock cero.
3. En Movimientos, registrar una entrada con cantidad positiva.
4. Crear un pedido para esa sucursal. El servidor calcula el total y descuenta existencias.
5. Desde el detalle, avanzar el estado o cancelar. Cancelar devuelve el stock.

Administración requiere rol `ADMINISTRADOR`; registrar inventario y movimientos permite también `ALMACÉN`; crear pedidos permite también `TIENDA`. Los tres roles pueden consultar los módulos operativos y cambiar estados de pedidos. Crear usuarios exige contraseña de al menos ocho caracteres; al editar, dejarla vacía conserva la actual.

El interceptor envía cookies y el token CSRF únicamente a la URL de la API. El login obtiene el token antes y después de autenticar. Las operaciones fallidas muestran un mensaje compartido y no ejecutan el callback de éxito. Durante las escrituras se deshabilitan los controles de la pantalla.

## Verificación

```bash
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

Las pruebas HTTP verifican sesión, renovación de CSRF, cookies y errores de stock. El backend Java se verifica con `mvn verify` desde la raíz y Angular no forma parte del JAR.
