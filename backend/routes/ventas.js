const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Registrar una nueva venta
router.post('/', (req, res) => {
  try {
    const {
      productos: productosBody,
      pago: pagoBody,
      cliente: clienteBody,
      metodoPago
    } = req.body;

    if (!Array.isArray(productosBody) || productosBody.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe incluir al menos un producto en la venta.'
      });
    }

    // 1. Carga de ofertas: mapeo producto_id 
    const ofertasRows = db.prepare(`SELECT producto_id, cantidad_minima, precio_total FROM ofertas`).all();
    const ofertasMap = {};
    ofertasRows.forEach(o => {
      ofertasMap[o.producto_id] = o;
    });

    let totalCalculado = 0;

    // 2. Recorremos cada producto para calcular subtotales (oferta + resto)
    productosBody.forEach(p => {
      const id = Number(p.id);
      const cantidad = Number(p.cantidad) || 1;
      const precioUnit = Number(p.precio) || 0;
      const oferta = ofertasMap[id];

      if (oferta && cantidad >= oferta.cantidad_minima) {
        const grupos = Math.floor(cantidad / oferta.cantidad_minima);
        const resto = cantidad % oferta.cantidad_minima;
        totalCalculado += grupos * oferta.precio_total + resto * precioUnit;
      } else {
        totalCalculado += cantidad * precioUnit;
      }
    });

    // 3. Definimos pago y vuelto
    const pago = typeof pagoBody === 'number' ? pagoBody : 0;
    const vuelto = Math.max(0, pago - totalCalculado);
    const cliente = clienteBody?.trim() || 'Consumidor Final';
    const itemsJson = JSON.stringify(productosBody);

    // 4. Insert de la venta
    const stmtVenta = db.prepare(`
      INSERT INTO ventas
        (fecha, total, pago, vuelto, cliente, metodo_pago, items)
      VALUES
        (datetime('now'), ?, ?, ?, ?, ?, ?)
    `);
    const infoVenta = stmtVenta.run(
      totalCalculado,
      pago,
      vuelto,
      cliente,
      metodoPago,
      itemsJson
    );

    // 5. Actualizar stock de cada producto vendido
    const stmtStock = db.prepare(`UPDATE productos SET stock = stock - ? WHERE id = ?`);
    productosBody.forEach(p => {
      const cantidad = Number(p.cantidad) || 1;
      stmtStock.run(cantidad, p.id);
    });

    // 6. Respuesta al cliente
    res.status(201).json({
      success: true,
      message: 'Venta registrada correctamente con ofertas aplicadas',
      data: {
        id: infoVenta.lastInsertRowid,
        fecha: new Date().toISOString(),
        total: totalCalculado,
        pago,
        vuelto,
        cliente,
        metodoPago,
        productos: productosBody
      }
    });

  } catch (error) {
    console.error('Error al guardar la venta con ofertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al procesar la venta',
      error: error.message
    });
  }
});

// Obtener todas las ventas
router.get('/', (req, res) => {
  try {
    const query = db.prepare(`
      SELECT
        id,
        datetime(fecha) AS fecha,
        total,
        pago,
        vuelto,
        cliente,
        metodo_pago,  -- snake_case
        items
      FROM ventas
      ORDER BY fecha DESC
    `);
    const filas = query.all();

    const ventas = filas.map(v => ({
      id: v.id,
      fecha: v.fecha,
      total: Number(v.total),
      pago: Number(v.pago),
      vuelto: Number(v.vuelto),
      cliente: v.cliente,
      metodoPago: v.metodo_pago,     
      productos: JSON.parse(v.items)
    }));

    res.json({ success: true, data: ventas });
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el historial de ventas',
      error: error.message
    });
  }
});

module.exports = router;