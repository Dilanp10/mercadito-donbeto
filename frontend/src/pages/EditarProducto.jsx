import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useInventario } from "../context/InventarioContext";

export default function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { productos, actualizarProducto, eliminarProducto } = useInventario();

  const [categorias, setCategorias] = useState([]);
  const [formulario, setFormulario] = useState({
    nombre: '',
    precio: 0,
    stock: 0,
    categoria: '',
    fechaVencimiento: ''
  });

  useEffect(() => {
    // Extraer categorías únicas de los productos existentes
    const cats = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
    setCategorias(cats);

    // Cargar datos del producto a editar
    const producto = productos.find(p => p.id === Number(id));
    if (producto) {
      setFormulario({
        nombre: producto.nombre || '',
        precio: producto.precio || 0,
        stock: producto.stock || 0,
        categoria: producto.categoria || '',
        fechaVencimiento: producto.fecha_vencimiento || '',
        id: producto.id
      });
    }
  }, [id, productos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actualizarProducto(formulario.id, {
        nombre: formulario.nombre,
        categoria: formulario.categoria,
        precio: Number(formulario.precio),
        stock: Number(formulario.stock),
        fechaVencimiento: formulario.fechaVencimiento
      });
      navigate("/inventario");
    } catch (error) {
      console.error("Error al actualizar producto:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  const handleEliminar = async () => {
    try {
      await eliminarProducto(formulario.id);
      navigate("/inventario");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  if (!formulario.id) return <p className="text-center">Cargando...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">Editar Producto</h1>

      <input
        type="text"
        name="nombre"
        value={formulario.nombre}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        placeholder="Nombre"
        required
      />

      <input
        type="number"
        name="precio"
        value={formulario.precio}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        placeholder="Precio"
        required
        min="0"
        step="0.01"
      />

      <input
        type="number"
        name="stock"
        value={formulario.stock}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        placeholder="Stock"
        required
        min="0"
      />

      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select
          name="categoria"
          value={formulario.categoria}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccionar categoría</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <input
        type="date"
        name="fechaVencimiento"
        value={formulario.fechaVencimiento.split('T')[0] || ''}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />

      <div className="flex gap-2">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Guardar Cambios
        </button>
        <button
          type="button"
          onClick={handleEliminar}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Eliminar Producto
        </button>
      </div>
    </form>
  );
}