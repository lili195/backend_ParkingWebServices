if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express');
const cors = require('cors')
const { upload } = require('./helpers/fileHandler');

const app = express();

const port = process.env.PORT;

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}))



const vehiclesDB = [];


function logRequest(ip, method, url, message, body) {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    console.log(`([Ip: ${ip}, Fecha: ${date}, Hora: ${time}] , Solicitud: ${method}, Mensaje: ${message}, Respuesta: ${JSON.stringify(body)})`);
}

// Endpoint para el registro de ingreso
app.post('/cars', upload.single('photo'), (req, res) => {
    logRequest(req.ip, 'POST', '/cars', 'Registro Carro', null);
    if (!req.file) {
        return res.status(400).json({ message: 'No se ha adjuntado ningún archivo' });
    }

    const { licensePlate, color } = req.body;
    const entryTime = new Date();
    const photoPath = req.file ? req.file.path : null;

    const vehicle = {
        licensePlate,
        color,
        entryTime,
        photoPath
    };

    const existingIndex = vehiclesDB.findIndex(vehicle => vehicle.licensePlate === licensePlate);

    if (existingIndex !== -1) {
        logRequest(req.ip, 'POST', '/cars', 'La placa ya está registrada:', vehiclesDB[existingIndex]);
        res.status(200).json({ message: 'La placa ya está registrada en el servidor' });
    } else {
        vehiclesDB.push(vehicle);
        logRequest(req.ip, 'POST', '/cars', 'Vehículo registrado con éxito:', vehicle);
        res.status(200).json({ message: 'Entrada del vehículo registrada con éxito en el servidor', vehicle });
    }
});

app.get('/cars', (req, res) => {
    try {
        logRequest(req.ip, 'GET', '/cars', 'Listar Carro');
        const vehicles = vehiclesDB.map(vehicle => ({
            licensePlate: vehicle.licensePlate,
            color: vehicle.color,
            entryTime: vehicle.entryTime,
            photo: getBase64Image(vehicle.photoPath)
        }));
        logRequest(req.ip, 'GET', '/cars', 'Respondiendo con la lista de vehículos:', vehiclesDB);
        res.status(200).json({ vehicles });

    } catch (error) {
        console.error('Error al procesar la solicitud GET en /cars:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Función para convertir la imagen a base64
function getBase64Image(path) {
    if (!path) {
        return null;
    }

    const fs = require('fs');
    const image = fs.readFileSync(path);
    return Buffer.from(image).toString('base64');
}

// // Middleware para retirar un carro por placa
app.patch('/cars', (req, res) => {
    logRequest(req.ip, 'PATCH', '/cars', 'Retirar Carro');
    const retiredPlate = req.body.licensePlate;
    logRequest(req.ip, 'PATCH', '/cars', 'Placa Retirada: ', retiredPlate);

    const retiredIndex = vehiclesDB.findIndex(vehicle => vehicle.licensePlate === retiredPlate);
    logRequest(req.ip, 'PATCH', '/cars', ' Posicion retirada: ', retiredIndex);


    if (retiredIndex !== -1) { // Cambiado para comparar con -1 en lugar de null
        vehiclesDB.splice(retiredIndex, 1);
        logRequest(req.ip, 'PATCH', '/cars', 'Vehiculo retirado exitosamente');
        res.status(200).json({ message: "Se retiró el vehiculo exitosamente" });
    } else {
        logRequest(req.ip, 'PATCH', '/cars', 'No se pudo retirar el vehiculo');
        res.status(400).json({ message: "No se retiró el vehiculo correctamente" });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto: ${port}`)
})