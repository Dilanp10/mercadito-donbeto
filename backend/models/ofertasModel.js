const db = require('../db/database');

/**
 * Crea una nueva oferta y calcula automáticamente el precio_total
 * @param {Object} oferta - Datos de la oferta
 * @param {number} oferta.producto_id - ID del producto
 * @param {number} oferta.cantidad_minima - Cantidad mínima
 * @param {number} oferta.precio_unitario - Precio por unidad
 * @returns {Promise<Object>} Oferta creada
 */
const crearOferta = async (oferta) => {
  try {
    const { producto_id, cantidad_minima, precio_unitario } = oferta;

    // Validaciones mejoradas
    if (!producto_id || !cantidad_minima || !precio_unitario) {
      throw new Error('Todos los campos son obligatorios');
    }

    if (isNaN(Number(cantidad_minima)) || isNaN(Number(precio_unitario))) {
      throw new Error('Cantidad y precio deben ser números válidos');
    }

    if (Number(cantidad_minima) <= 0 || Number(precio_unitario) <= 0) {
      throw new Error('Cantidad y precio deben ser mayores a cero');
    }

    const sql = `
      INSERT INTO ofertas (producto_id, cantidad_minima, precio_unitario)
      VALUES (?, ?, ?)
    `;
    
    const stmt = db.prepare(sql);
    const result = stmt.run(
      producto_id,
      Number(cantidad_minima),
      Number(precio_unitario)
    );

    // Obtener la oferta recién creada con JOIN al producto
    const nuevaOferta = db.prepare(`
      SELECT 
        o.*,
        p.nombre as producto_nombre,
        p.precio as precio_normal,
        p.stock
      FROM ofertas o
      JOIN productos p ON o.producto_id = p.id
      WHERE o.id = ?
    `).get(result.lastInsertRowid);

    return nuevaOferta;

  } catch (error) {
    console.error('Error detallado en crearOferta:', {
      message: error.message,
      code: error.code, // Código de error SQLite
      stack: error.stack,
      data: oferta
    });

    // Manejo específico de errores de SQLite
    if (error.code === 'SQLITE_CONSTRAINT') {
      if (error.message.includes('FOREIGN KEY')) {
        throw new Error('El producto especificado no existe');
      }
      if (error.message.includes('UNIQUE')) {
        throw new Error('Ya existe una oferta similar para este producto');
      }
    }

    throw new Error('Error al crear la oferta: ' + error.message);
  }
};

/**
 * Obtiene todas las ofertas con información del producto
 * @returns {Promise<Array>} Lista de ofertas
 */
const obtenerOfertas = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        o.id,
        o.producto_id,
        o.cantidad_minima,
        o.precio_unitario,
        o.precio_total,
        o.created_at,
        p.nombre AS producto_nombre,
        p.stock AS producto_stock
      FROM ofertas o
      JOIN productos p ON o.producto_id = p.id
      ORDER BY o.created_at DESC
    `;

    try {
      const rows = db.prepare(sql).all();
      resolve(rows);
    } catch (err) {
      console.error("Error en obtenerOfertas:", err);
      reject(new Error("Error al obtener las ofertas"));
    }
  });
};

/**
 * Elimina una oferta por su ID
 * @param {number} id - ID de la oferta a eliminar
 * @returns {Promise<Object>} Resultado de la operación
 */
const eliminarOferta = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM ofertas WHERE id = ?`;
    
    try {
      const stmt = db.prepare(sql);
      const result = stmt.run(id);
      resolve(result);
    } catch (err) {
      console.error("Error en eliminarOferta:", err);
      reject(new Error("Error al eliminar la oferta"));
    }
  });
};

module.exports = {
  crearOferta,
  obtenerOfertas,
  eliminarOferta
};