import { useInventario } from "../context/InventarioContext";
import { useState } from "react";
import { Link } from "react-router-dom";

const categorias = ['gaseosas', 'alimentos', 'bazar', 'carniceria', 'limpieza'];

export default function Inventario() {
  const { productos } = useInventario();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const filtrarProductos = () => {
    if (!productos || !Array.isArray(productos)) return [];
    
    return productos
      .filter(p => {
        if (!p) return false;
        return categoriaSeleccionada === "todos" || p.categoria === categoriaSeleccionada;
      })
      .filter(p => {
        if (!p || !p.nombre) return false;
        return p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      });
  };

  const productosFiltrados = filtrarProductos();

  return (
  <div className="container mx-auto px-4 py-8 max-w-7xl">
    {/* Encabezado y botón de nuevo producto */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
        Gestión de Inventario
      </h1>
      <Link
        to="/nuevo-producto"
        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 hover:shadow-xl"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Nuevo Producto
      </Link>
    </div>

    {/* Filtros */}
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

      <div className="mb-2">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Filtrar por categoría</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setCategoriaSeleccionada("todos")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              categoriaSeleccionada === "todos" 
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md" 
                : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
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
    </div>

    {/* Lista de productos */}
    {productosFiltrados.length === 0 ? (
      <div className="bg-white rounded-xl shadow-lg p-10 text-center border border-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-4 text-xl font-medium text-gray-700">No se encontraron productos</h3>
        <p className="mt-2 text-gray-500">Intenta con otro término de búsqueda o categoría</p>
        <button 
          onClick={() => { setBusqueda(''); setCategoriaSeleccionada('todos'); }}
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300 text-sm font-medium"
        >
          Limpiar filtros
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {productosFiltrados.map((p) => {
          if (!p) return null;
          
          const estaVencido = new Date(p.fechaVencimiento) < new Date();
          const porVencer = !estaVencido && new Date(p.fechaVencimiento) < new Date(Date.now() + 7 * 86400000);

          return (
            <div key={p.id || Math.random()} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 truncate" title={p.nombre}>
                    {p.nombre || 'Nombre no disponible'}
                  </h2>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    p.categoria === 'gaseosas' ? 'bg-blue-50 text-blue-700' :
                    p.categoria === 'alimentos' ? 'bg-green-50 text-green-700' :
                    p.categoria === 'bazar' ? 'bg-purple-50 text-purple-700' :
                    p.categoria === 'carniceria' ? 'bg-red-50 text-red-700' :
                    'bg-yellow-50 text-yellow-700'
                  }`}>
                    {(p.categoria || '').charAt(0).toUpperCase() + (p.categoria || '').slice(1)}
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Stock:</span>
                    <span className={`font-medium ${
                      (p.stock || 0) <= 5 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {p.stock || 0} {(p.stock || 0) <= 5 && <span className="ml-1">⚠️</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Precio:</span>
                    <span className="font-medium text-gray-900">${(Number(p.precio) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Ingreso:</span>
                    <span>{p.fecha_ingreso ? new Date(p.fecha_ingreso).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Vence:</span>
                    <span className={
                      estaVencido 
                        ? 'text-red-600 font-bold' 
                        : porVencer
                          ? 'text-yellow-600 font-medium'
                          : 'text-gray-600'
                    }>
                      {p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString() : 'N/A'}
                      {estaVencido && <span className="ml-1">(Vencido)</span>}
                      {porVencer && <span className="ml-1">(Próximo)</span>}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Link 
                    to={`/editar-producto/${p.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-300 flex items-center group-hover:underline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar producto
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
}