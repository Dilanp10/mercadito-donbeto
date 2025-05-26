// models/compraModel.js
const db = require('../db/database');

function registrarCompra(cuentaId, producto, cantidad, precio, fecha) {
  const stmt = db.prepare(`
    INSERT INTO compras (cuenta_id, producto, cantidad, precio, fecha)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(cuentaId, producto, cantidad, precio, fecha);
  return {
    id: result.lastInsertRowid,
    cuenta_id: cuentaId,
    producto,
    cantidad,
    precio,
    fecha
  };
}

function obtenerComprasDeCuenta(cuentaId) {
  return db.prepare(`
    SELECT id, producto, cantidad, precio, fecha 
    FROM compras
    WHERE cuenta_id = ?
    ORDER BY fecha DESC
  `).all(cuentaId);
}

function eliminarComprasDeCuenta(cuentaId) {
  return db.prepare('DELETE FROM compras WHERE cuenta_id = ?')
           .run(cuentaId);
}

module.exports = {
  registrarCompra,
  obtenerComprasDeCuenta,
  eliminarComprasDeCuenta
};