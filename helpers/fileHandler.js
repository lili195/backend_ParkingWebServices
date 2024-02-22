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
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

module.exports = { upload };

