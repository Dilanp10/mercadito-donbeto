// routes/ofertas.js
const express = require("express");
const router = express.Router();
const ofertasController = require("../controllers/ofertasController");

router.get("/", ofertasController.obtenerOfertas);
router.post("/", ofertasController.crearOferta);
router.delete("/:id", ofertasController.eliminarOferta);

module.exports = router;