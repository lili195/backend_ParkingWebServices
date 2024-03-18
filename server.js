if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express');
const cors = require('cors')
const { upload } = require('./helpers/fileHandler');
const { Pool } = require('pg');

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

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });
  

  app.post('/cars', upload.single('photo'), async (req, res) => {
    logRequest(req.ip, 'POST', '/cars', 'Registro Carro', null);
    if (!req.file) {
        return res.status(400).json({ message: 'No se ha adjuntado ningún archivo' });
    }

    const { licensePlate, color } = req.body;
    const entryTime = new Date();
    const photoPath = req.file ? req.file.path : null;

    try {
        // Verificar si la placa ya está registrada
        const client = await pool.connect();
        const existingVehicle = await client.query('SELECT * FROM vehicles WHERE licensePlate = $1', [licensePlate]);
        client.release();

        if (existingVehicle.rows.length > 0) {
            // Si ya existe un vehículo con esa placa, informar al usuario
            return res.status(400).json({ message: 'La placa ya está registrada en la base de datos' });
        }

        const insertResult = await client.query('INSERT INTO vehicles (licenseplate, color, entryTime, photopath) VALUES ($1, $2, $3, $4)', [licensePlate, color, entryTime, photoPath]);


        logRequest(req.ip, 'POST', '/cars', 'Vehículo registrado con éxito:', { licensePlate, color, entryTime, photoPath });
        res.status(200).json({ message: 'Entrada del vehículo registrada con éxito en la base de datos' });
    } catch (err) {
        console.error('Error al insertar vehículo en la base de datos:', err);
        res.status(500).json({ message: 'Error interno del servidor al registrar el vehículo' });
    }
});


app.get('/cars', async (req, res) => {
    try {
        logRequest(req.ip, 'GET', '/cars', 'Listar Carro');
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM vehicles');
        const vehicles = result.rows;
        client.release();
        logRequest(req.ip, 'GET', '/cars', 'Respondiendo con la lista de vehículos:', vehicles);
        res.status(200).json({ vehicles });
    } catch (error) {
        console.error('Error al procesar la solicitud GET en /cars:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


app.patch('/cars', async (req, res) => {
    const { licensePlate } = req.body;
    logRequest(req.ip, 'PATCH', '/cars', 'Retirar Carro');
    
    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM vehicles WHERE licenseplate = $1', [licensePlate]);
        client.release();
        if (result.rowCount > 0) {
            logRequest(req.ip, 'PATCH', '/cars', 'Vehículo retirado exitosamente');
            res.status(200).json({ message: "Se retiró el vehículo exitosamente" });
        } else {
            logRequest(req.ip, 'PATCH', '/cars', 'No se pudo retirar el vehículo');
            res.status(404).json({ message: "No se encontró el vehículo para retirar" });
        }
    } catch (err) {
        console.error('Error al retirar vehículo de la base de datos:', err);
        res.status(500).json({ message: 'Error interno del servidor al retirar el vehículo' });
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



app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto: ${port}`)
})