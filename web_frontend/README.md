# ShopChain — Frontend Angular

## Características

- Autenticación JWT Bearer, almacenamiento en `sessionStorage` y rutas protegidas mediante un guard.
- Panel principal con métricas, stock por sucursal y actividad reciente.
- Catálogo con búsqueda, filtros, disponibilidad y detalle de stock por sucursal.
- Gestión de pedidos con listado, creación, detalle y seguimiento por estados.
- Inventario consultable por producto y sucursal, con filtros por sede y estado.
- Registro de entradas, salidas y reposiciones de stock.
- Sugerencias de reposición para artículos con stock bajo o agotado.
- Administración de productos, sucursales y usuarios con formularios reactivos.
- Gestión de roles y estado de acceso de usuarios.
- Interfaz Bootstrap 5 con Bootstrap Icons y diseño adaptable para escritorio y pantallas pequeñas.
- Componentes standalone y páginas con carga diferida mediante Angular Router.

Los datos se consultan y guardan en el backend. Al recargar, se consulta `/auth/me` con el JWT guardado para recuperar el usuario.

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
- `src/app/core/services`: llamadas HTTP por módulo, autenticación JWT y mensajes de error.
- `src/app/core/interceptors`: cabecera Bearer para la API; errores de negocio y estado de guardado compartido.
- `src/app/core/guards`: validación de sesión y roles.
- `src/app/shared`: layout reutilizable y pipe de colores Bootstrap para estados.
- `src/app/features`: `auth`, `home`, `catalog`, `orders`, `inventory` y `administration`.
- `src/environments`: URL base de la API.

## Interfaz y estilos

Bootstrap y Bootstrap Icons se instalan con npm y se cargan localmente desde
`angular.json`, incluyendo el JavaScript de Bootstrap para el menú offcanvas móvil
(cierre con Escape, fondo superpuesto y gestión del foco). Las pantallas utilizan
la cuadrícula responsive, formularios, tablas, tarjetas, alertas y utilidades de Bootstrap.
Los filtros se aplican al cambiar sus campos.

`src/styles.css` conserva únicamente ajustes del layout, dimensiones específicas
y la conexión de los estados de validación de Angular con los colores de Bootstrap.
Los colores de estados de pedidos, inventario y movimientos se centralizan en
`src/app/shared/pipes/status-badge.pipe.ts`.

## Flujo de inventario y pedidos

1. Crear el producto en Administración, seleccionando una categoría de la API.
2. En Inventario, registrar producto, sucursal y stock mínimo. Comienza con stock cero.
3. En Movimientos, registrar una entrada con cantidad positiva.
4. Crear un pedido para esa sucursal. El servidor calcula el total y descuenta existencias.
5. Desde el detalle, avanzar el estado o cancelar. Cancelar devuelve el stock.

Administración requiere rol `ADMINISTRADOR`; registrar inventario y movimientos permite también `ALMACÉN`; crear pedidos permite también `TIENDA`. Los tres roles pueden consultar los módulos operativos y cambiar estados de pedidos. Crear usuarios exige contraseña de al menos ocho caracteres; al editar, dejarla vacía conserva la actual.

## Flujo de autenticación sencillo

1. `AuthService.login()` envía JSON `{ identifier, password }` a `/auth/login`.
2. Guarda `accessToken` en `sessionStorage` y conserva el `user` recibido para la interfaz.
3. `apiInterceptor` añade `Authorization: Bearer <token>` únicamente a la API, excepto al login.
4. Al recargar, el guard llama a `/auth/me` usando el token guardado.
5. Ante `401`, se limpia el token y se vuelve al login. Salir borra localmente el token y el usuario, sin petición HTTP.

El JWT dura 30 minutos desde su emisión por defecto, configurable en el backend con
`JWT_EXPIRATION_MINUTES`. No hay refresh tokens ni renovación automática. Se elimina
del almacenamiento de la pestaña al cerrarla; una recarga conserva el token.
`sessionStorage` es accesible desde JavaScript. El cierre local no revoca una copia
del JWT que otro cliente conserve: sigue siendo válida hasta el vencimiento.

Las operaciones fallidas muestran un mensaje compartido y no ejecutan el callback de éxito. Durante las escrituras se deshabilitan los controles de la pantalla.

## Verificación

```bash
npm run build
node ./node_modules/@angular/cli/bin/ng.js test --watch=false --browsers=ChromeHeadless
```

Las pruebas HTTP verifican login JSON, almacenamiento y envío del JWT, restauración del usuario, limpieza ante `401`, cierre local, exclusión de destinos externos y errores de stock. El backend Java se verifica con `mvn verify` desde la raíz y Angular no forma parte del JAR.
