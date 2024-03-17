# Imagen base de Node.js
FROM node

# Establece el directorio de trabajo en /app
WORKDIR /app_server_one

# Copia los archivos necesarios
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY . .

# Instala las dependencias
RUN npm install

# Expone el puerto en el que la aplicación va a ejecutarse
EXPOSE $PORT

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]
