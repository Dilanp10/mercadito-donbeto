const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cuentasController');

router.post('/',        ctrl.crearCuenta);
router.get('/',         ctrl.buscarCuentas);
router.get('/:id',      ctrl.obtenerHistorialCuenta);
router.get('/:id/compras', ctrl.obtenerComprasDeCuenta);
router.post('/:id/compras', ctrl.agregarCompra);
router.delete('/:id',   ctrl.eliminarCuenta);

module.exports = router;