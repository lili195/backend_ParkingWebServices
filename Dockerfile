# Imagen base de Node.js
FROM node

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia los archivos necesarios
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY . .

# Instala las dependencias
RUN npm install

# Expone las variables de entorno con las que aplicación va a ejecutarse
EXPOSE $PORT
EXPOSE $DATABASE_URL
EXPOSE $BALANCER_URL
EXPOSE $MONITOR_URL
EXPOSE $IP_ADDRESS

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]
