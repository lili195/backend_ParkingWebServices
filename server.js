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


// // Endpoint para listar vehículos registrados
// app.get('/cars', (req, res) => {
//     // Resto del código para listar vehículos
// });

// // Middleware para retirar un carro por placa
// app.patch('/cars', (req, res) => {
//     // Resto del código para retirar un carro
// });

app.listen(port, () => {
    console.log('Listening on localhost:3000')
})