# Configuración de Cloudinary

En esta guía vas a crear una cuenta en Cloudinary y obtener las credenciales que la app usa
para subir y servir imágenes. Al final vas a completar el archivo `.env` con tres variables.

## Crear cuenta

1. Andá al sitio oficial: <https://cloudinary.com/>.
2. Tocá el botón **"Sign up free"** / **"Registrarse"** (según el idioma de la página).
3. Podés registrarte con un email o con tu cuenta de Google.
4. El plan gratuito es suficiente para empezar.

## Ingresar al dashboard

Una vez creada la cuenta, entrás a la consola de Cloudinary:

- <https://console.cloudinary.com/>

## Encontrar las credenciales

Dentro del dashboard, la sección **"Account Details"** / **"Detalles de la cuenta"**
(también accesible desde *Settings → Credentials*, en una ruta del estilo
`https://console.cloudinary.com/settings/c-<tu-cloud-name>/credentials`)
muestra tres valores:

- **Cloud name**: suele verse como `dxxxxxxxxx` o como un nombre personalizado.
  Corresponde a la variable `CLOUDINARY_CLOUD_NAME`.
- **API Key**: es un número. Corresponde a la variable `CLOUDINARY_API_KEY`.
- **API Secret**: es una cadena larga. Corresponde a la variable `CLOUDINARY_API_SECRET`.

## `.env` final

Copiá los valores de tu dashboard en el archivo `.env` del proyecto:

```env
CLOUDINARY_CLOUD_NAME="TU_CLOUD_NAME"
CLOUDINARY_API_KEY="TU_API_KEY"
CLOUDINARY_API_SECRET="TU_API_SECRET"
```

## Tip de seguridad

- **No expongas el API Secret**: es una credencial sensible. En el dashboard podés
  restringir su uso desde **"Security Settings"** si hace falta.
- La **API Key** y el **API Secret** son credenciales de **servidor**: nunca deben ir en
  código cliente ni con el prefijo `NEXT_PUBLIC_`, porque quedarían visibles en el navegador.
