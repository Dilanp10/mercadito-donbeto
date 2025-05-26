// frontend/context/InventarioContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';
import { toast } from 'react-hot-toast';

const InventarioContext = createContext();

export function InventarioProvider({ children }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar productos inicial
  const cargarProductos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/productos');
      setProductos(res.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar los productos');
      toast.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarProductos(); }, []);

  // Agregar producto
  const agregarProducto = async producto => {
    try {
      const res = await api.post('/productos', producto);
      setProductos(prev => [...prev, res.data]);
      toast.success('Producto agregado con éxito');
      return res.data;
    } catch (err) {
      console.error('Error al agregar producto:', err);
      toast.error(err.response?.data?.error || 'Error al agregar producto');
      throw err;
    }
  };

  // Actualizar producto (PATCH)
  const actualizarProducto = async (id, datosActualizados) => {
    try {
      const res = await api.patch(`/productos/${id}`, datosActualizados);
      setProductos(prev => prev.map(p => p.id === id ? res.data : p));
      toast.success('Producto actualizado con éxito');
      return res.data;
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      toast.error(err.response?.data?.error || 'Error al actualizar producto');
      throw err;
    }
  };

  // Eliminar producto
  const eliminarProducto = async id => {
    try {
      await api.delete(`/productos/${id}`);
      setProductos(prev => prev.filter(p => p.id !== id));
      toast.success('Producto eliminado con éxito');
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      toast.error(err.response?.data?.error || 'Error al eliminar producto');
      throw err;
    }
  };

  const obtenerProductoPorId = id => productos.find(p => p.id === id);

  return (
    <InventarioContext.Provider value={{
      productos,
      loading,
      error,
      cargarProductos,
      agregarProducto,
      actualizarProducto,
      eliminarProducto,
      obtenerProductoPorId
    }}>
      {children}
    </InventarioContext.Provider>
  );
}

export function useInventario() {
  const context = useContext(InventarioContext);
  if (!context) throw new Error('useInventario debe usarse dentro de InventarioProvider');
  return context;
}