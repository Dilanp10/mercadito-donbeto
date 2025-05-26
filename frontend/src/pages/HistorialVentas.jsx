import React, { useState, useEffect } from 'react';
import axios from 'axios';

const metodosPago = ['todos', 'efectivo', 'transferencia', 'tarjeta'];

const HistorialVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filterMetodo, setFilterMetodo] = useState('todos');

  const obtenerVentas = async () => {
    try {
      setCargando(true);
      const response = await axios.get('http://localhost:3001/api/ventas');
      setVentas(response.data.data || response.data.ventas || response.data);
    } catch (err) {
      console.error('Error al obtener ventas:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'No se pudieron cargar las ventas.'
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerVentas();
  }, []);

  // Filtrar ventas por método de pago
  const ventasFiltradas = filterMetodo === 'todos'
    ? ventas
    : ventas.filter(v => v.metodoPago === filterMetodo);

  if (cargando) return <p className="text-center text-lg">Cargando ventas...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Historial de Ventas</h1>

      {/* Filtro de método de pago */}
      <div className="mb-4 flex items-center gap-2">
        <label className="font-medium">Filtrar por método de pago:</label>
        <select
          value={filterMetodo}
          onChange={e => setFilterMetodo(e.target.value)}
          className="p-2 border rounded"
        >
          {metodosPago.map(m => (
            <option key={m} value={m}>
              {m === 'todos' ? 'Todos' : m.charAt(0).toUpperCase() + m.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {ventasFiltradas.length === 0 ? (
        <p className="text-center text-gray-600">No hay ventas para mostrar.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ventasFiltradas.map((venta) => {
            const totalSinOfertas = venta.total_sin_ofertas || venta.productos?.reduce((sum, p) => sum + (p.precio * p.cantidad), 0) || venta.total;
            const ahorroTotal = venta.ahorro || (totalSinOfertas - venta.total);
            const tieneOfertas = ahorroTotal > 0;

            return (
              <div
                key={venta.id}
                className={`bg-white shadow-md rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-shadow ${tieneOfertas ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">
                    {venta.fecha ? new Date(venta.fecha).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : 'Fecha desconocida'}
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-semibold text-green-600">
                      ${venta?.total != null ? Number(venta.total).toFixed(2) : '0.00'}
                    </span>
                    {tieneOfertas && (
                      <span className="text-xs text-blue-600">
                        Ahorro: ${ahorroTotal.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-3 space-y-1">
                  <p className="text-gray-700">
                    <span className="font-medium">Cliente:</span> {venta.cliente || 'Desconocido'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Método de pago:</span> {venta.metodoPago}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Pagó:</span> ${venta?.pago != null ? Number(venta.pago).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Vuelto:</span> ${venta?.vuelto != null ? Number(venta.vuelto).toFixed(2) : '0.00'}
                  </p>
                </div>

                <ul className="space-y-2">
                  {venta.productos?.length > 0 ? (
                    venta.productos.map((prod, idx) => {
                      const precioFinal = prod.precio_final || prod.precio;
                      const aplicoOferta = prod.aplico_oferta || (precioFinal < prod.precio);
                      const ahorroItem = (prod.precio * prod.cantidad) - (precioFinal * prod.cantidad);

                      return (
                        <li key={idx} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-700">{prod.nombre || 'Producto sin nombre'}</p>
                            <div className="text-sm text-gray-500">
                              {prod.cantidad || 0} × 
                              {aplicoOferta ? (
                                <>
                                  <span className="line-through text-gray-400 mx-1">${Number(prod.precio).toFixed(2)}</span>
                                  <span className="text-blue-600">${Number(precioFinal).toFixed(2)}</span>
                                </>
                              ) : (
                                ` $${Number(prod.precio).toFixed(2)}`
                              )}
                              {aplicoOferta && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                  Oferta
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="text-sm font-medium text-gray-800">
                              ${(precioFinal * prod.cantidad).toFixed(2)}
                            </p>
                            {aplicoOferta && (
                              <p className="text-xs text-green-600">
                                -${ahorroItem.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <li className="text-gray-500">Sin productos</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistorialVentas;