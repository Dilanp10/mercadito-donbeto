import { useState, useEffect, useMemo } from 'react';
import { useInventario } from '../context/InventarioContext';
import api from '../lib/axios';

const metodosPago = ['efectivo', 'transferencia', 'tarjeta'];

export default function VentasPage() {
  const { productos, actualizarProducto } = useInventario();
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [pagoRecibido, setPagoRecibido] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [ofertas, setOfertas] = useState([]);

  // 1. Carga las ofertas al montar
  useEffect(() => {
    api.get('/ofertas')
      .then(res => {
        if (res.data.success) {
          setOfertas(res.data.data);
        }
      })
      .catch(() => {
        // si hay error, las ofertas quedan vacías
        setOfertas([]);
      });
  }, []);

  // 2. Prepara un mapa de ofertas por producto_id
  const ofertasMap = useMemo(() => {
    const map = {};
    ofertas.forEach(o => {
      map[o.producto_id] = {
        cantidad_minima: o.cantidad_minima,
        precio_total: o.precio_total
      };
    });
    return map;
  }, [ofertas]);

  // categorías
  const categorias = useMemo(() => {
    const cats = new Set();
    productos.forEach(p => p.categoria && cats.add(p.categoria));
    return Array.from(cats);
  }, [productos]);

  // filtrar productos disponibles
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
    (categoriaSeleccionada === 'todos' || p.categoria === categoriaSeleccionada) &&
    p.stock > 0
  );

  const agregarAlCarrito = (producto) => {
    setCarrito(items => {
      const ya = items.find(i => i.id === producto.id);
      if (ya) {
        return items.map(i =>
          i.id === producto.id
            ? { ...i, cantidad: Math.min(i.cantidad + 1, i.stock) }
            : i
        );
      }
      return [...items, { ...producto, cantidad: 1 }];
    });
  };

  const actualizarCantidad = (id, cantidad) => {
    setCarrito(items =>
      items.map(i =>
        i.id === id
          ? { ...i, cantidad: Math.max(1, Math.min(cantidad, i.stock)) }
          : i
      )
    );
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(items => items.filter(i => i.id !== id));
  };

  // Función para calcular subtotal de un item con oferta
 const calcularSubtotal = (item) => {
  const oferta = ofertasMap[item.id];
  if (!oferta) return item.precio * item.cantidad;

  const cant = item.cantidad;
  const cantMinima = oferta.cantidad_minima;
  const precioOferta = oferta.precio_total / cantMinima; // Precio unitario en oferta

  if (cant >= cantMinima) {
    const gruposOferta = Math.floor(cant / cantMinima);
    const resto = cant % cantMinima;
    return (gruposOferta * oferta.precio_total) + (resto * precioOferta);
  }
  return cant * item.precio;
};

  // Total de la venta con ofertas
  const total = carrito.reduce((sum, item) => sum + calcularSubtotal(item), 0);

  const vuelto = Math.max(0, pagoRecibido - total);

  const finalizarVenta = async () => {
    if (carrito.length === 0) {
      setMensaje('Debe agregar al menos un producto.');
      return;
    }
    try {
      await api.post('/ventas', {
        cliente: cliente.trim() || 'Consumidor Final',
        pago: pagoRecibido,
        vuelto,
        total,
        metodoPago,
        productos: carrito.map(p => ({
          id: p.id,
          nombre: p.nombre,
          cantidad: p.cantidad,
          precio: p.precio
        })),
        fecha: new Date().toISOString()
      });

      // Actualiza stock
      carrito.forEach(p => {
        actualizarProducto(p.id, { stock: p.stock - p.cantidad });
      });

      // Resetea formulario
      setCarrito([]);
      setCliente('');
      setMetodoPago('efectivo');
      setPagoRecibido(0);
      setMensaje('✅ Venta registrada correctamente.');
    } catch {
      setMensaje('❌ Error al registrar la venta.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Sistema de Ventas
        </h1>
        <div className="flex items-center gap-3">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Total: ${total.toFixed(2)}
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Vuelto: ${vuelto.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Sección de productos */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="mb-6">
          <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-2">Buscar producto</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="busqueda"
              type="text"
              placeholder="Escribe el nombre del producto..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Filtrar por categoría</h2>
          <div className="flex flex-wrap gap-3">
            {['todos', ...categorias].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  categoriaSeleccionada === cat 
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md" 
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de productos */}
        {productosFiltrados.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-10 text-center border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-700">No se encontraron productos</h3>
            <p className="mt-2 text-gray-500">Intenta con otro término de búsqueda o categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {productosFiltrados.map(p => (
              <button
                key={p.id}
                onClick={() => agregarAlCarrito(p)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group p-4 text-left"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-base font-semibold text-gray-900 truncate" title={p.nombre}>
                    {p.nombre}
                  </h2>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.categoria === 'gaseosas' ? 'bg-blue-50 text-blue-700' :
                    p.categoria === 'alimentos' ? 'bg-green-50 text-green-700' :
                    p.categoria === 'bazar' ? 'bg-purple-50 text-purple-700' :
                    p.categoria === 'carniceria' ? 'bg-red-50 text-red-700' :
                    'bg-yellow-50 text-yellow-700'
                  }`}>
                    {p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1)}
                  </span>
                </div>

                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Stock:</span>
                    <span className={`font-medium ${
                      p.stock <= 5 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {p.stock} {p.stock <= 5 && <span className="ml-1">⚠️</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Precio:</span>
                    <span className="font-medium text-gray-900">${p.precio.toFixed(2)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      

      {/* Sección del carrito */}
  <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Carrito de Compras</h2>
  
  {carrito.length === 0 ? (
    <div className="bg-gray-50 rounded-xl p-10 text-center border border-gray-200">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h3 className="mt-4 text-xl font-medium text-gray-700">Tu carrito está vacío</h3>
      <p className="mt-2 text-gray-500">Agrega productos para comenzar una venta</p>
    </div>
  ) : (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unitario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carrito.map(item => {
              const oferta = ofertasMap[item.id];
              const subtotal = calcularSubtotal(item);
              const subtotalSinOferta = item.precio * item.cantidad;
              const ahorroItem = subtotalSinOferta - subtotal;
              const precioUnitarioOferta = oferta ? (oferta.precio_total / oferta.cantidad_minima) : item.precio;
              const aplicaOferta = oferta && item.cantidad >= oferta.cantidad_minima;

              return (
                <tr key={item.id} className={aplicaOferta ? "bg-blue-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.nombre}</div>
                        {oferta && (
                          <div className="text-xs text-blue-600 mt-1">
                            Oferta: {oferta.cantidad_minima} x ${precioUnitarioOferta.toFixed(2)} c/u
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {aplicaOferta ? (
                        <>
                          <span className="line-through text-gray-400 mr-1">${item.precio.toFixed(2)}</span>
                          <span className="text-green-600 font-medium">${precioUnitarioOferta.toFixed(2)}</span>
                        </>
                      ) : (
                        `$${item.precio.toFixed(2)}`
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={item.cantidad}
                        onChange={e => actualizarCantidad(item.id, parseInt(e.target.value))}
                        className="w-20 p-2 border rounded-lg text-center focus:ring-blue-500 focus:border-blue-500"
                      />
                      {oferta && item.cantidad < oferta.cantidad_minima && (
                        <span className="ml-2 text-xs text-yellow-600">
                          Faltan {oferta.cantidad_minima - item.cantidad} para oferta
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${subtotal.toFixed(2)}
                      {ahorroItem > 0 && (
                        <div className="text-xs text-green-600">
                          Ahorraste ${ahorroItem.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => eliminarDelCarrito(item.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="bg-gray-50 p-4 rounded-lg w-full md:w-1/2 space-y-2">
          <div className="flex justify-between py-2">
            <span className="font-medium text-gray-700">Productos:</span>
            <span className="font-medium">{carrito.reduce((sum, item) => sum + item.cantidad, 0)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium text-gray-700">Subtotal sin ofertas:</span>
            <span className="font-medium">${carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium text-gray-700">Descuentos:</span>
            <span className="font-medium text-green-600">
              -${(carrito.reduce((sum, item) => {
                const oferta = ofertasMap[item.id];
                if (!oferta) return sum;
                return sum + (item.precio * item.cantidad) - calcularSubtotal(item);
              }, 0).toFixed(2))}
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium text-gray-700">Total con ofertas:</span>
            <span className="font-bold text-lg">${total.toFixed(2)}</span>
          </div>
          
          {total > 0 && (
            <div className="flex justify-between py-2 bg-blue-50 rounded-lg px-3">
              <span className="font-medium text-blue-700">Vuelto estimado:</span>
              <span className="font-bold text-blue-800">${vuelto.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    </>
  )}
</div>

      {/* Sección de información de pago */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de Pago</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">Cliente (opcional)</label>
            <input
              type="text"
              id="cliente"
              placeholder="Nombre del cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            />
          </div>

          <div>
            <label htmlFor="metodoPago" className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
            <select
              id="metodoPago"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              {metodosPago.map(m => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pagoRecibido" className="block text-sm font-medium text-gray-700 mb-1">Pago recibido</label>
            <input
              type="number"
              id="pagoRecibido"
              placeholder="Monto recibido"
              value={pagoRecibido === 0 ? '' : pagoRecibido}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  setPagoRecibido(value);
                } else if (e.target.value === '') {
                  setPagoRecibido(0);
                }
              }}
              min="0"
              step="0.01"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            />
          </div>

          <div className="flex items-end">
            <div className="bg-blue-50 p-4 rounded-xl w-full">
              <div className="flex justify-between">
                <span className="font-medium text-blue-800">Vuelto:</span>
                <span className="font-bold text-blue-900">${vuelto.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {mensaje && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
            mensaje.includes("éxito") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {mensaje}
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={finalizarVenta}
            disabled={carrito.length === 0}
            className={`w-full py-3 px-4 rounded-xl font-medium text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              carrito.length === 0 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 hover:shadow-xl"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Finalizar Venta
          </button>
        </div>
      </div>
    </div>
  );
}