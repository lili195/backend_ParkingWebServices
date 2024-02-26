require('dotenv').config();
const express = require('express');
const cors = require('cors')
const { upload } = require('./helpers/fileHandler');

const app = express();
const port = 8000;

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors({
    origin: 'http://localhost:8080',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}))

const vehiclesDB = [];

// Middleware para el registro de ingreso
app.post('/cars', upload.single('photo'), (req, res) => {
    const { licensePlate, color } = req.body;
    const entryTime = new Date();
    const photoPath = req.file ? req.file.path : null;

    if (photoPath) {
        const vehicle = {
            licensePlate,
            color,
            entryTime,
            photoPath
        };
        vehiclesDB.push(vehicle);
        console.log('Vehiculo registrado con éxito:', vehicle);
        res.status(200).json({ message: 'Entrada del vehículo registrada con éxito en el servidor', vehicle });
    } else {
        console.log('No se pudo obtener la imagen:', photoPath);
        res.status(400).json({ message: 'No fue posible registrar el vehículo en el servidor' });
    }
});

app.get('/cars', (req, res) => {
    try {
        console.log('Solicitud GET recibida en /cars: ', new Date().toLocaleString());
        const vehicles = vehiclesDB.map(vehicle => ({
            licensePlate: vehicle.licensePlate,
            color: vehicle.color,
            entryTime: vehicle.entryTime,
            photo: getBase64Image(vehicle.photoPath)
        }));

        console.log('Respondiendo con la lista de vehículos:', vehicles);
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
    const retiredPlate = req.body;
    const retiredIndex = vehiclesDB.findIndex(vehicule => vehicule.licensePlate === retiredPlate);
    if (retiredIndex != null) {
        vehiclesDB.splice(retiredIndex, 1);
        console.log("Vehiculo retirado exitosamente");
        res.status(200).json({ message: "Se retiro el vehiculo exitosamente" })
    } else {
        console.log("No se pudo retirar el vehiculo");
        res.status(400).json({ message: "No se retiro el vehiculo correctamente" })
    }
});

app.listen(port, () => {
    console.log('Listening on localhost:3000')
})