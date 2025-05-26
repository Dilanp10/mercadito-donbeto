// app.js
const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');
const cuentasRoutes = require('./routes/cuentas'); // ✅ NUEVO
const notasRouter = require('./routes/notas');
const ofertasRoutes = require('./routes/ofertas');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/cuentas', cuentasRoutes); // ✅ NUEVO
app.use('/api/notas', notasRouter);
app.use("/api/ofertas", ofertasRoutes);
module.exports = app;