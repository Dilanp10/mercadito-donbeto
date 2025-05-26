// backend/routes/notas.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Crear tabla de notas (ejecutar una sola vez)
db.prepare(`
  CREATE TABLE IF NOT EXISTS notas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Obtener todas las notas
router.get('/', (req, res) => {
  try {
    const notas = db.prepare('SELECT * FROM notas ORDER BY fecha_creacion DESC').all();
    res.json(notas);
  } catch (error) {
    console.error('Error al obtener notas:', error);
    res.status(500).json({ error: "Error al obtener notas" });
  }
});

// Crear nueva nota
router.post('/', (req, res) => {
  const { titulo, descripcion } = req.body;
  if (!titulo || !descripcion) {
    return res.status(400).json({ error: "Título y descripción son requeridos" });
  }

  try {
    const stmt = db.prepare('INSERT INTO notas (titulo, descripcion) VALUES (?, ?)');
    const result = stmt.run(titulo, descripcion);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error('Error al crear nota:', err);
    res.status(500).json({ error: "Error al crear nota" });
  }
});

// Eliminar nota
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM notas WHERE id = ?');
    const result = stmt.run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Nota no encontrada" });
    }
    res.json({ message: "Nota eliminada correctamente" });
  } catch (err) {
    console.error('Error al eliminar nota:', err);
    res.status(500).json({ error: "Error al eliminar nota" });
  }
});

module.exports = router;