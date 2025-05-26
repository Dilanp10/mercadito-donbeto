// backend/routes/productos.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Obtener todos los productos
router.get('/', (req, res) => {
  try {
    const productos = db.prepare('SELECT * FROM productos').all();
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Crear nuevo producto
router.post('/', (req, res) => {
  const { nombre, categoria, precio, stock, fechaIngreso, fechaVencimiento, lote } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO productos
        (nombre, categoria, precio, stock, fecha_ingreso, fecha_vencimiento, lote)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      nombre,
      categoria,
      precio,
      stock,
      fechaIngreso,
      fechaVencimiento,
      lote || null
    );
    const nuevoProducto = db.prepare('SELECT * FROM productos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(nuevoProducto);
  } catch (err) {
    console.error('Error al insertar producto:', err);
    res.status(400).json({ error: 'Error al insertar producto' });
  }
});

// Actualizar parcialmente producto por ID (PATCH)
router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const updates = req.body;

  try {
    // Verificar existencia
    const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Mapeo de campos camelCase -> snake_case
    const fieldMap = {
      nombre: 'nombre',
      categoria: 'categoria',
      precio: 'precio',
      stock: 'stock',
      fechaVencimiento: 'fecha_vencimiento',
      lote: 'lote'
    };

    const setClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      const column = fieldMap[key];
      if (!column) {
        return res.status(400).json({ error: `Campo '${key}' no permitido.` });
      }
      setClauses.push(`${column} = ?`);
      values.push(value);
    }

    if (updates.stock !== undefined) {
      if (typeof updates.stock !== 'number' || updates.stock < 0) {
        return res.status(400).json({ error: 'El stock debe ser un número ≥ 0.' });
      }
    }

    const sql = `UPDATE productos SET ${setClauses.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values, id);

    const actualizado = db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
    res.json(actualizado);
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Actualizar producto completo por ID (PUT)
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { nombre, categoria, precio, stock, fechaVencimiento, lote } = req.body;
  try {
    const stmt = db.prepare(`
      UPDATE productos
      SET nombre = ?, categoria = ?, precio = ?, stock = ?, fecha_vencimiento = ?, lote = ?
      WHERE id = ?
    `);
    const result = stmt.run(
      nombre,
      categoria,
      precio,
      stock,
      fechaVencimiento,
      lote || null,
      id
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const actualizado = db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
    res.json({ message: 'Producto actualizado correctamente', data: actualizado });
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(400).json({ error: 'Error al actualizar producto' });
  }
});

// Eliminar producto por ID
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  try {
    const stmt = db.prepare('DELETE FROM productos WHERE id = ?');
    const result = stmt.run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(400).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
