// fileHandler.js

const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Directorio de destino para las fotos de los carros
const uploadDirectory = 'fotosCarros';

// Crea el directorio si no existe
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

// Configuración de multer para manejar la carga de archivos
const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: function (req, file, cb) {
    // Cambia el nombre del archivo para incluir un timestamp único

    console.log("Archivo entrante: ",file.mimetype)
    const timestamp = Date.now();
    const fileExtension = file.mimetype.split('/')[1]; 
    const newFileName = `${timestamp}.${fileExtension}`;
    console.log("Archivo procesado: ",newFileName)
    cb(null, newFileName);
  }
});

const upload = multer({ storage: storage });

module.exports = { upload };