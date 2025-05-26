const cuentaModel = require('../models/cuentaModel');
const compraModel = require('../models/compraModel');

async function crearCuenta(req, res) {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'Nombre es requerido' });
    }

    const result = await cuentaModel.crearCuenta(nombre);
    return res.status(201).json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        nombre
      }
    });
  } catch (err) {
    console.error('crearCuenta:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function buscarCuentas(req, res) {
  try {
    const { q = '' } = req.query;
    const cuentas = await cuentaModel.buscarCuentasPorNombre(q);
    return res.json({ success: true, data: cuentas });
  } catch (err) {
    console.error('buscarCuentas:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function obtenerHistorialCuenta(req, res) {
  try {
    const { id } = req.params;
    const cuenta = await cuentaModel.obtenerCuentaPorId(id);
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    const compras = await compraModel.obtenerComprasDeCuenta(id);

    return res.json({
      success: true,
      data: { cuenta, compras }
    });
  } catch (err) {
    console.error('obtenerHistorialCuenta:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function obtenerComprasDeCuenta(req, res) {
  try {
    const { id } = req.params;
    const comprasRaw = await compraModel.obtenerComprasDeCuenta(id);

    const compras = comprasRaw.map(c => ({
      id: c.id,
      fecha: c.fecha,
      productos: [{
        id: c.id,
        nombre: c.producto,
        precio: parseFloat(c.precio),
        cantidad: parseInt(c.cantidad, 10)
      }]
    }));

    return res.json({ success: true, data: compras });
  } catch (err) {
    console.error('obtenerComprasDeCuenta:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function agregarCompra(req, res) {
  try {
    const { id } = req.params;
    const { productos } = req.body;

    if (!Array.isArray(productos)) {
      return res.status(400).json({ error: 'Formato de productos inválido' });
    }

    const fecha = new Date().toISOString();
    const resultados = [];

    for (const p of productos) {
      const cantidad = parseInt(p.cantidad, 10);
      const precio = parseFloat(p.precio_unitario ?? p.precio);

      if (!p.nombre || isNaN(precio) || isNaN(cantidad)) {
        return res.status(400).json({
          error: 'Producto con datos incompletos o inválidos',
          producto: p
        });
      }

      const resultado = await compraModel.registrarCompra(
        id,
        p.nombre,
        cantidad,
        precio,
        fecha
      );
      resultados.push(resultado);
    }

    return res.status(201).json({ success: true, data: resultados });
  } catch (err) {
    console.error('agregarCompra:', err);
    return res.status(500).json({
      error: 'Error al registrar compras',
      detalles: err.message
    });
  }
}

async function eliminarCuenta(req, res) {
  try {
    const { id } = req.params;
    await compraModel.eliminarComprasDeCuenta(id);
    const borrada = await cuentaModel.eliminarCuenta(id);
    if (!borrada) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error('eliminarCuenta:', err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  crearCuenta,
  buscarCuentas,
  obtenerHistorialCuenta,
  obtenerComprasDeCuenta,
  agregarCompra,
  eliminarCuenta
};