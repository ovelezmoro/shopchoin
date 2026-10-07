# ShopChain — Backend Spring Boot

API REST para usuarios, catálogo, sucursales, inventario y pedidos. Implementada con **Java 17, Spring Boot 3.5, Spring Web, Spring Data JPA y H2**.

## Ejecutar

Para publicar frontend y backend como demo gratuita, sigue la [guía de despliegue en Render](documentation/DEPLOYMENT.md).

Requisitos: JDK 17 o superior compatible con Spring Boot 3.5 y Maven 3.6.3 o superior.

```bash
mvn spring-boot:run
```

URL base: **http://localhost:8080/shopchain/api**.

También se puede generar y ejecutar el JAR con Tomcat embebido:

```bash
mvn clean verify
java -jar target/shopchain.jar
```

El backend ya no requiere instalar Tomcat externo. Su interfaz es REST: las vistas JSP y los servlets iniciales fueron reemplazados por controladores Spring.

## Datos de desarrollo

El perfil predeterminado es `dev`. Al arrancar sobre una base vacía, crea:

- Administrador: **`admin@shopchain.pe` / `admin123`**.
- Una categoría, seis productos y cuatro sucursales.
- Inventario por producto/sucursal y movimientos de carga inicial.

La carga inicial se ejecuta una sola vez sobre una base vacía; no reemplaza datos al reiniciar. Los pedidos se crean mediante la API.

H2 guarda los datos en **`data/shopchain.mv.db`**, relativo al directorio desde el que se ejecuta la aplicación. La carpeta `data/` está excluida de Git. Para reiniciar la demostración, detener la aplicación y eliminar esa carpeta local.

| Variable de entorno | Valor predeterminado | Uso |
|---|---|---|
| `PORT` | `8080` | Puerto HTTP |
| `DB_URL` | `jdbc:h2:file:./data/shopchain` | Conexión H2 |
| `DB_USERNAME` | `sa` | Usuario de base de datos |
| `DB_PASSWORD` | vacío | Contraseña de base de datos |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:4200` | Orígenes permitidos, separados por comas |
| `DEMO_ADMIN_PASSWORD` | `admin123` | Contraseña usada al crear el administrador de demostración |
| `JWT_SECRET` | Clave de demostración solo en `dev` | Clave de firma HS256, mínimo 32 bytes UTF-8; configurar una clave secreta aleatoria fuera de desarrollo |
| `JWT_EXPIRATION_MINUTES` | `30` | Duración fija del token desde su emisión, en minutos |

`application-dev.yml` utiliza `ddl-auto: update` para crear y actualizar las tablas durante el desarrollo. La configuración base usa `validate`; si se activa otro perfil, debe prepararse su esquema y sus usuarios. El perfil `test` usa H2 en memoria, sin datos de demostración.

## Estructura y recorrido del código

```text
src/main/java/pe/edu/upn/
├── ShopchainApplication.java
├── config/       # Seguridad, CORS y datos de demostración
├── controller/   # Rutas HTTP y validación de solicitudes
├── dto/          # Datos de entrada y salida de la API
├── entity/       # Entidades y relaciones JPA
├── exception/    # Errores de negocio y respuestas HTTP
├── repository/   # Interfaces JpaRepository
└── service/      # Reglas de negocio
```

Flujo: **Controller → Service → Repository → H2**.

Para estudiar el proyecto, empezar con `BranchController`, `BranchService`, `BranchRepository` y `Branch`. Después revisar `InventoryService` y `OrderService`.

- Cada entidad tiene su propio `id`, atributos privados y getters/setters.
- Los repositorios usan `JpaRepository` y métodos derivados, como `findByEmail`.
- Los servicios reciben sus dependencias por constructor.
- Los filtros se resuelven con listas, bucles y condiciones sencillas.
- Los DTO evitan enviar entidades JPA o contraseñas almacenadas al cliente.
- `@Transactional` permite guardar un pedido y sus movimientos como una sola operación: si falla, se deshacen todos los cambios.

## API

Swagger UI: **http://localhost:8080/shopchain/api/docs** (acceso público).
Contrato YAML: [src/main/resources/openapi.yml](src/main/resources/openapi.yml),
publicado en **http://localhost:8080/shopchain/api/openapi.yml**.

Para probar la API desde Swagger, ejecutar `POST /auth/login` en **Autenticación**
con JSON `{ "identifier": "admin@shopchain.pe", "password": "admin123" }`.
Copiar `accessToken` de la respuesta, pulsar **Authorize** y pegar el token
sin escribir el prefijo `Bearer`. Los permisos dependen del rol del usuario.
Los recursos de Swagger están incluidos en el JAR y no requieren un CDN.

Consulta [documentation/API.md](documentation/API.md) para ver rutas, permisos, cuerpos JSON y un ejemplo completo de login con PowerShell.

La autenticación usa Spring Security, contraseñas BCrypt y **JWT Bearer**. El login
recibe JSON con `identifier` y `password`, y devuelve `accessToken`, `tokenType`,
`expiresIn` (segundos) y `user`. Las siguientes solicitudes envían
`Authorization: Bearer <accessToken>`. No se usan cookies de autenticación ni CSRF.

### Autenticación paso a paso

1. `AuthController` valida las credenciales mediante `AuthenticationManager` y BCrypt.
2. `JwtService` crea un token firmado con el correo, los roles y la fecha de vencimiento.
3. Spring Security verifica firma, emisor y vencimiento en cada solicitud; `JwtConfig` configura esa validación.
4. Angular guarda el token en `sessionStorage`; su interceptor añade la cabecera únicamente a la API.
5. Ante un `401`, Angular borra la autenticación y solicita iniciar sesión nuevamente.

El token dura 30 minutos desde el login por defecto, aunque se siga usando la aplicación.
No hay refresh tokens ni renovación automática. El botón Salir borra el token del
navegador; no hay endpoint de logout ni revocación. Una copia del token sigue siendo
válida hasta vencer. Los cambios de rol, correo, contraseña o estado no revocan tokens
ya emitidos; sus permisos se mantienen hasta el vencimiento. `sessionStorage` sobrevive
a recargas, queda limitado a la pestaña y es accesible desde JavaScript.

### Reglas de inventario y pedidos

- El inventario se registra por **producto y sucursal**, inicialmente con stock cero.
- Las cantidades de entrada son positivas. El tipo de movimiento determina si se suman o se restan.
- Un pedido descuenta stock al crearse y calcula precios y total desde los productos guardados.
- Cancelar un pedido devuelve sus existencias una sola vez y registra movimientos de entrada.
- Estados: `Pendiente → En preparación → Listo para retiro → Completado`.
- Se permite cancelar antes de completar; un pedido completado no se cancela.
- Los detalles conservan el nombre y precio del producto al comprar.
- La talla es informativa: esta versión no lleva stock separado por talla.

Esta implementación didáctica valida el stock disponible en cada operación, pero no incorpora bloqueos ni control de versiones para escrituras simultáneas. Los filtros y métricas recorren listas completas y están pensados para el volumen de datos del proyecto universitario.

## Pruebas

```bash
mvn clean verify
```

Las pruebas de integración de `ShopchainApiTest` utilizan Spring, MockMvc y una base H2 en memoria. Cubren login JSON, JWT válidos, vencidos, alterados y de emisor incorrecto, roles, CORS, CRUD, restricciones de unicidad, movimientos, totales, estados, conservación de precios y rollback de pedidos fallidos.

`DocumentationTest` verifica el acceso público al YAML y los recursos de Swagger,
las referencias del contrato y la cobertura de las rutas de negocio.

## Frontend Angular

El frontend integrado se ejecuta por separado en `web_frontend/` con `npm install` y `npm start`. Abrir `http://localhost:4200` mientras el backend está en ejecución. Su configuración apunta a `http://localhost:8080/shopchain/api` y usa JWT Bearer. Angular no forma parte del JAR.

Flujo para cargar stock desde la web: crear el producto en Administración, registrarlo en Inventario para una sucursal con su stock mínimo y registrar una entrada en Movimientos. Los pedidos descuentan existencias; su cancelación las devuelve. Ver [web_frontend/README.md](web_frontend/README.md).
