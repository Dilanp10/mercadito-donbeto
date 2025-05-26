const ofertasModel = require("../models/ofertasModel");

/**
 * Crea una nueva oferta con precio_unitario (calcula precio_total internamente)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const crearOferta = async (req, res) => {
  try {
    const { producto_id, cantidad_minima, precio_unitario } = req.body;

    // Validación básica
    if (!producto_id || !cantidad_minima || !precio_unitario) {
      return res.status(400).json({
        success: false,
        error: "Todos los campos son obligatorios",
        details: {
          producto_id: producto_id ? "OK" : "Falta producto_id",
          cantidad_minima: cantidad_minima ? "OK" : "Falta cantidad_minima",
          precio_unitario: precio_unitario ? "OK" : "Falta precio_unitario"
        }
      });
    }

    const nuevaOferta = await ofertasModel.crearOferta({
      producto_id,
      cantidad_minima,
      precio_unitario
    });

    return res.status(201).json({
      success: true,
      data: nuevaOferta
    });

  } catch (error) {
    console.error('Error en crearOferta (controller):', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });

    // Determinar código de estado apropiado
    const statusCode = 
      error.message.includes('no existe') ? 404 :
      error.message.includes('existe una oferta') ? 409 :
      error.message.includes('deben ser') ? 400 : 500;

    return res.status(statusCode).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Obtiene todas las ofertas con información del producto
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const obtenerOfertas = async (req, res) => {
  try {
    const ofertas = await ofertasModel.obtenerOfertas();
    res.json({
      success: true,
      data: ofertas
    });
  } catch (error) {
    console.error("Error al obtener ofertas:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener ofertas",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Elimina una oferta por ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const eliminarOferta = async (req, res) => {
  try {
    const result = await ofertasModel.eliminarOferta(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Oferta no encontrada" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Oferta eliminada correctamente",
      data: result 
    });
  } catch (error) {
    console.error("Error al eliminar oferta:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error al eliminar oferta",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  crearOferta,
  obtenerOfertas,
  eliminarOferta
};