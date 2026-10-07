# Demo gratuita en Render

Angular se publica como **Static Site** y Spring Boot como **Web Service Free**.
H2 funciona en memoria: cada arranque restaura los datos de ejemplo y elimina los cambios anteriores.
Render suspende el backend después de 15 minutos sin tráfico; la siguiente visita puede tardar alrededor de un minuto.
Los servicios gratuitos están sujetos a los límites de uso de Render.

## 1. Subir los cambios a GitHub

Publica en `main` los archivos de despliegue y el código actual de la aplicación.
El workflow verificará ambos proyectos. El paso de despliegue fallará hasta configurar los secretos del paso 4; es esperado en esta primera ejecución.

## 2. Crear los dos servicios

1. En [Render](https://dashboard.render.com/), conecta tu cuenta de GitHub.
2. Selecciona **New → Blueprint** y el repositorio `ovelezmoro/shopchoin`, rama `main`.
3. Render leerá `render.yaml` y creará `shopchain-backend` y `shopchain-frontend`.
4. Completa las variables solicitadas:

| Servicio | Variable | Valor inicial |
|---|---|---|
| Backend | `DEMO_ADMIN_PASSWORD` | Una contraseña que elijas para la demo |
| Backend | `CORS_ALLOWED_ORIGINS` | `https://shopchain-frontend.onrender.com` |
| Frontend | `API_URL` | `https://shopchain-backend.onrender.com/shopchain/api` |

Estos dominios son provisionales: Render puede asignarles un sufijo. Corrígelos en el paso siguiente usando las URLs reales.
`JWT_SECRET` se genera automáticamente. El backend usa el perfil `demo` y el puerto que Render proporciona mediante `PORT`.
Comprueba que el backend tenga plan **Free**; el sitio estático es gratuito y no necesita plan de cómputo.

## 3. Conectar las URLs reales

En la cabecera de cada servicio, Render muestra su URL pública:

1. En **Frontend → Environment**, cambia `API_URL` a la URL real del backend seguida de `/shopchain/api`.
2. En **Backend → Environment**, cambia `CORS_ALLOWED_ORIGINS` a la URL real del frontend, **sin barra final ni ruta**.
3. Guarda y redespliega ambos servicios para aplicar los valores. `API_URL` se incorpora durante la compilación de Angular.

Ejemplo: backend `https://shopchain-backend-ab12.onrender.com` → API `https://shopchain-backend-ab12.onrender.com/shopchain/api`.
No uses URLs de Deploy Hook en estas variables ni pongas claves secretas en `API_URL`.

## 4. Conectar GitHub Actions

En cada servicio de Render, entra a **Settings → Deploy Hook** y copia su URL secreta.
Después, en el repositorio de GitHub, abre **Settings → Secrets and variables → Actions → New repository secret**:

| Nombre del secreto | Valor |
|---|---|
| `RENDER_BACKEND_DEPLOY_HOOK_URL` | Deploy Hook del backend |
| `RENDER_FRONTEND_DEPLOY_HOOK_URL` | Deploy Hook del frontend |

No publiques estos hooks en archivos. El Blueprint desactiva el autodespliegue por commit de cada servicio (`autoDeployTrigger: 'off'`) para que GitHub Actions controle las verificaciones.
La creación inicial y los cambios de configuración del Blueprint pueden generar despliegues desde Render.

En GitHub, abre **Actions → Verify and deploy to Render → Run workflow**, seleccionando `main`.
Los siguientes pushes a `main` harán lo mismo automáticamente. Los pull requests solo ejecutan verificaciones.

El workflow ejecuta pruebas y empaquetado Maven con Java 17, construye Docker, ejecuta las pruebas Angular en ChromeHeadless y compila el frontend para Render.
Solo cuando ambos jobs pasan, solicita desplegar el mismo SHA verificado en ambos servicios.
**Un workflow verde confirma que Render aceptó las solicitudes; no que terminó el despliegue.** Revisa **Events → Live** en ambos servicios.

## 5. Probar la demo

1. Abre `https://TU-BACKEND.onrender.com/shopchain/api/docs` y espera a que despierte.
2. Abre el frontend e inicia sesión con **`admin@shopchain.pe`** y la contraseña configurada en `DEMO_ADMIN_PASSWORD`.
3. Comprueba catálogo e inventario y recarga una ruta interna del frontend para verificar la navegación de Angular.

Si aparece un error CORS, revisa que `CORS_ALLOWED_ORIGINS` coincida exactamente con el origen de la pestaña.
Si el navegador intenta conectar a `localhost`, revisa `API_URL` y vuelve a desplegar el frontend.
Cada reinicio del backend restaura usuarios, productos, sucursales e inventario de demostración.

## Desarrollo local

`mvn spring-boot:run` y `npm start` siguen usando la configuración local.
`npm run build:render` requiere `API_URL` HTTPS terminada en `/shopchain/api`; genera un archivo de entorno excluido de Git.

Referencias: [límites gratuitos](https://render.com/docs/free), [Blueprints](https://render.com/docs/blueprint-spec), [Deploy Hooks](https://render.com/docs/deploy-hooks).
