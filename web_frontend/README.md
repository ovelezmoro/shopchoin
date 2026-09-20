# ShopChain — Frontend Angular

Interfaz independiente para la plataforma de inventarios y logística de calzado deportivo. Usa mocks centralizados y servicios `Observable`, preparados para una futura API REST.

## Requisitos

- Node.js 20.19 o 22.12 (o superior compatible con Angular 20)
- npm 10 o superior

## Instalación y ejecución

```bash
cd web_frontend
npm install
npm start
```

URL: <http://localhost:4200>

Credenciales mock: `admin@shopchain.pe` / `admin123`

## Estructura

- `src/app/core`: modelos, mocks, servicios y guard.
- `src/app/shared`: layout reutilizable.
- `src/app/features`: `auth`, `home`, `catalog`, `orders`, `inventory` y `administration`.
- `src/environments`: URL base de la futura API.

Verificación: `npm run build`. El backend Java permanece independiente y Angular no forma parte del WAR.
