import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { useInventario } from '../context/InventarioContext';
import { toast } from 'react-hot-toast';

const parsearFecha = (fechaString) => {
  if (!fechaString) return new Date();
  const fecha = new Date(fechaString);
  return !isNaN(fecha.getTime()) ? fecha : new Date();
};

export default function DetalleCuenta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cuenta, setCuenta] = useState({ nombre: '' });
  const [compras, setCompras] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(false);
  const { productos, actualizarProducto } = useInventario();

  // Carga inicial de cuenta y compras
  useEffect(() => {
    if (id === 'nueva') return;
    const cargarDatos = async () => {
      try {
        const [cuentaRes, comprasRes] = await Promise.all([
          axios.get(`/cuentas/${id}`),
          axios.get(`/cuentas/${id}/compras`)
        ]);
        setCuenta(cuentaRes.data);

        const comprasData = comprasRes.data?.data || comprasRes.data?.compras || [];
        const comprasNormalizadas = comprasData.map(compra => {
          const productosCompra = Array.isArray(compra.productos)
            ? compra.productos
            : [{
                id: compra.producto_id || compra.id,
                nombre: compra.nombre_producto || compra.nombre,
                precio: parseFloat(compra.precio) || 0,
                cantidad: parseInt(compra.cantidad, 10) || 1
              }];
          return {
            ...compra,
            productos: productosCompra.map(p => ({
              id: p.id,
              nombre: p.nombre,
              precio: parseFloat(p.precio) || 0,
              cantidad: parseInt(p.cantidad, 10) || 1
            })),
            fecha: parsearFecha(compra.fecha)
          };
        });
        setCompras(comprasNormalizadas);
      } catch (error) {
        console.error('Error al cargar la cuenta:', error);
        toast.error('Error al cargar los datos de la cuenta');
      }
    };
    cargarDatos();
  }, [id]);

  // Agrega un producto al carrito respetando stock
  const agregarProducto = (producto) => {
    if (producto.stock <= 0) {
      toast.error('No hay suficiente stock disponible');
      return;
    }
    const existe = carrito.find(p => p.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(p =>
        p.id === producto.id
          ? { ...p, cantidad: Math.min(p.cantidad + 1, producto.stock) }
          : p
      ));
    } else {
      setCarrito([...carrito, {
        ...producto,
        cantidad: 1,
        precio: parseFloat(producto.precio) || 0
      }]);
    }
  };

  // Elimina un producto del carrito
  const eliminarProducto = (idProducto) => {
    setCarrito(carrito.filter(p => p.id !== idProducto));
  };

  // Guarda la compra, actualiza backend, contexto y recarga datos
  const guardarCompra = async () => {
    if (!carrito.length || loading) return;
    setLoading(true);
    try {
      const compraData = {
        productos: carrito.map(p => ({
          producto_id: p.id,
          nombre: p.nombre,
          cantidad: p.cantidad,
          precio_unitario: p.precio
        })),
        fecha: new Date().toISOString()
      };

      // Disminuir stock en contexto
      await Promise.all(carrito.map(p =>
        actualizarProducto(p.id, {
          stock: Math.max(0, p.stock - p.cantidad)
        })
      ));

      // Registrar compra en backend
      await axios.post(`/cuentas/${id}/compras`, compraData);

      // Recargar datos de cuenta y compras
      const [cuentaRes, comprasRes] = await Promise.all([
        axios.get(`/cuentas/${id}`),
        axios.get(`/cuentas/${id}/compras`)
      ]);
      setCuenta(cuentaRes.data);
      const comprasRaw = comprasRes.data?.data || comprasRes.data?.compras || [];
      const comprasNormalizadas = comprasRaw.map(compra => {
        const productosCompra = Array.isArray(compra.productos)
          ? compra.productos
          : [{
              id: compra.producto_id || compra.id,
              nombre: compra.nombre_producto || compra.nombre,
              precio: parseFloat(compra.precio) || 0,
              cantidad: parseInt(compra.cantidad, 10) || 1
            }];
        return {
          ...compra,
          productos: productosCompra.map(p => ({
            id: p.id,
            nombre: p.nombre,
            precio: parseFloat(p.precio) || 0,
            cantidad: parseInt(p.cantidad, 10) || 1
          })),
          fecha: parsearFecha(compra.fecha)
        };
      });
      setCompras(comprasNormalizadas);

      setCarrito([]);
      toast.success('Compra registrada con éxito');
    } catch (error) {
      console.error('Error al guardar compra:', error);
      toast.error(error.response?.data?.error || 'Error al guardar la compra');
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva cuenta
  const crearCuenta = async () => {
    try {
      await axios.post('/cuentas', { nombre: cuenta.nombre });
      navigate('/cuentas');
      toast.success('Cuenta creada con éxito');
    } catch (error) {
      console.error('Error al crear la cuenta:', error);
      toast.error(error.response?.data?.error || 'Error al crear la cuenta');
    }
  };

  // Si es una cuenta nueva
  if (id === 'nueva') {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Crear nueva cuenta</h1>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nombre:</label>
          <input
            type="text"
            value={cuenta.nombre}
            onChange={e => setCuenta({ nombre: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Nombre de la cuenta"
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/cuentas')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={crearCuenta}
            disabled={!cuenta.nombre.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex-1"
          >
            Crear cuenta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{cuenta.nombre}</h1>
        <button
          onClick={() => navigate('/cuentas')}
          className="text-blue-600 hover:underline"
        >
          ← Volver a cuentas
        </button>
      </div>

      {/* Formulario y carrito */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Agregar nueva compra</h2>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {productos
            .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
            .map(p => (
              <button
                key={p.id}
                onClick={() => agregarProducto(p)}
                disabled={p.stock <= 0}
                className={`border p-3 rounded hover:shadow transition ${
                  p.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="font-semibold">{p.nombre}</div>
                <div className="text-sm text-gray-600">Stock: {p.stock}</div>
                <div className="text-sm font-medium text-green-700">
                  ${parseFloat(p.precio).toFixed(2)}
                </div>
              </button>
            ))}
        </div>

        {carrito.length > 0 && (
          <>
            <h3 className="font-semibold mb-3">Resumen de compra</h3>
            <div className="border rounded-lg p-4 mb-4">
              {carrito.map(p => {
                const subtotal = p.precio * p.cantidad;
                return (
                  <div key={p.id} className="flex justify-between items-center mb-2">
                    <span>{p.nombre} x{p.cantidad}</span>
                    <div className="flex items-center">
                      <span>${subtotal.toFixed(2)}</span>
                      <button
                        onClick={() => eliminarProducto(p.id)}
                        className="ml-2 text-red-600 hover:text-red-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
                <span>Total:</span>
                <span>
                  ${carrito
                    .reduce((sum, p) => sum + p.precio * p.cantidad, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={guardarCompra}
              disabled={loading}
              className={`w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Procesando...' : 'Registrar compra'}
            </button>
          </>
        )}
      </div>

      {/* Historial de Compras */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Historial de Compras</h2>
        {compras.length === 0 ? (
          <p className="text-gray-500">No hay compras registradas</p>
        ) : (
          <ul className="space-y-3">
            {compras.map(compra => {
              const total = compra.productos.reduce(
                (sum, p) => sum + p.precio * p.cantidad, 0
              );
              return (
                <li key={compra.id} className="border p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">
                    {compra.fecha.toLocaleString('es-ES', {
                      day: '2-digit', month: '2-digit',
                      year: 'numeric', hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <ul className="space-y-2">
                    {compra.productos.map(p => (
                      <li key={`${compra.id}-${p.id}`} className="flex justify-between">
                        <span>{p.nombre} x{p.cantidad}</span>
                        <span>${(p.precio * p.cantidad).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-2 border-t text-right font-semibold">
                    Total: ${total.toFixed(2)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}