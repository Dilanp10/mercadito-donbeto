// models/cuentaModel.js
const db = require('../db/database');

function crearCuenta(nombre) {
  const stmt = db.prepare('INSERT INTO cuentas (nombre) VALUES (?)');
  const result = stmt.run(nombre);
  return { lastInsertRowid: result.lastInsertRowid };
}

function buscarCuentasPorNombre(q = '') {
  const sql = q
    ? 'SELECT * FROM cuentas WHERE nombre LIKE ? ORDER BY id DESC'
    : 'SELECT * FROM cuentas ORDER BY id DESC';
  const params = q ? [`%${q}%`] : [];
  return db.prepare(sql).all(...params);
}

function obtenerCuentaPorId(id) {
  return db.prepare('SELECT * FROM cuentas WHERE id = ?').get(id);
}

function eliminarCuenta(id) {
  const result = db.prepare('DELETE FROM cuentas WHERE id = ?').run(id);
  return result.changes > 0;
}

module.exports = {
  crearCuenta,
  buscarCuentasPorNombre,
  obtenerCuentaPorId,
  eliminarCuenta
};