## Contacto

Puedes encontrarme en LinkedIn:
[<img align="left" alt="LinkedIn" width="22px" src="https://github.com/devicons/devicon/blob/master/icons/linkedin/linkedin-original.svg" />](https://www.linkedin.com/in/franco-ortellado/)
[Franco Ortellado](https://www.linkedin.com/in/franco-ortellado/)


# ChatRoom

Este proyecto es una aplicación de chat desarrollada en dos partes: el frontend y el backend.

<br>

  <img align="left" width="70" height="70" src="https://github.com/devicons/devicon/blob/master/icons/react/react-original.svg">
 <img align="left" width="70" height="70" src="https://cdn.worldvectorlogo.com/logos/cloudinary-2.svg">
<img align="left" width="70" height="70" src="https://github.com/devicons/devicon/blob/master/icons/tailwindcss/tailwindcss-plain.svg">
<img align="left" width="70" height="70" src="https://github.com/devicons/devicon/blob/master/icons/nodejs/nodejs-original.svg">
<img align="left" width="70" height="70" src="https://github.com/devicons/devicon/blob/master/icons/express/express-original.svg">
<img align="left" width="70" height="70" src="https://github.com/devicons/devicon/blob/master/icons/mongodb/mongodb-original.svg">
<img align="left" width="70" height="70" src="https://www.vectorlogo.zone/logos/axios/axios-ar21.svg">


<br>
<br>
<br>

## Backend

El backend de la aplicación se encuentra en la carpeta `api`. Utiliza las siguientes tecnologías:

- **Node.js** <img src="https://github.com/devicons/devicon/blob/master/icons/nodejs/nodejs-original.svg" width="20" height="20"> y **Express** <img src="https://github.com/devicons/devicon/blob/master/icons/express/express-original.svg" width="20" height="20"> para el servidor.
- **MongoDB** <img src="https://github.com/devicons/devicon/blob/master/icons/mongodb/mongodb-original.svg" width="20" height="20"> y **Mongoose** para la comunicación con la base de datos.
- **Dotenv** para la configuración de variables de entorno. 🔧
- **JSON Web Tokens (JWT)** para la autenticación y generación de tokens. 🔐
- **Cors** para permitir peticiones desde el frontend. 🌐
- **Bcrypt.js** para el hashing de contraseñas. 🔒
- **ws** para la comunicación WebSocket. 🌐

Para ejecutar el backend, sigue estos pasos:

1. Instala las dependencias usando el comando `npm install`.
2. Crea un archivo `.env` en la carpeta `api` y define las variables de entorno necesarias (por ejemplo, `MONGO_URL` y `JWT_SECRET`).
3. Ejecuta el servidor usando el comando `npm start`.

## Frontend

El frontend de la aplicación se encuentra en la carpeta `front`. Utiliza las siguientes tecnologías:

- **React** <img src="https://github.com/devicons/devicon/blob/master/icons/react/react-original.svg" width="20" height="20"> y **Vite** para el desarrollo del frontend. 
- **Tailwind CSS** <img src="https://github.com/devicons/devicon/blob/master/icons/tailwindcss/tailwindcss-plain.svg" width="20" height="20"> para los estilos. 
- **Axios** <img src="https://www.vectorlogo.zone/logos/axios/axios-ar21.svg" width="20" height="20"> para realizar peticiones HTTP al backend. 
- **React Context** para gestionar el estado de la aplicación. 🔄
- **Cloudinary** <img src="https://cdn.worldvectorlogo.com/logos/cloudinary-2.svg" width="20" height="20"> para almacenar y gestionar las imágenes. ☁

Para ejecutar el frontend, sigue estos pasos:

1. Instala las dependencias usando el comando `npm install`.
2. Ejecuta el servidor de desarrollo usando el comando `npm run dev`.

## Funcionalidades

El objetivo de esta aplicación de chat es permitir a los usuarios registrarse, iniciar sesión, chatear con otros usuarios y cerrar sesión. Algunas funcionalidades destacadas son:

- **Registro de usuarios:** los usuarios pueden registrarse proporcionando un nombre de usuario y una contraseña.
- **Inicio de sesión:** los usuarios pueden iniciar sesión con su nombre de usuario y contraseña.
- **Lista de usuarios en línea:** se muestra una lista de usuarios en línea disponibles para chatear.
- **Envío de mensajes:** los usuarios pueden enviar mensajes de texto o imágenes a otros usuarios.
- **Almacenamiento de imágenes:** las imágenes enviadas por los usuarios se almacenan en Cloudinary para su gestión.
- **Cierre de sesión:** los usuarios pueden cerrar sesión en la aplicación.
