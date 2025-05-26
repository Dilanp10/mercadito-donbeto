import { useState, useEffect } from 'react';
import api from '../lib/axios';


export default function Notas() {
  const [notas, setNotas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaNota, setNuevaNota] = useState({
    titulo: '',
    descripcion: ''
  });

  // Obtener todas las notas
  const obtenerNotas = async () => {
    try {
      const response = await api.get('/notas');
      const data = response.data;
      setNotas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al obtener notas:', error);
    }
  };

  useEffect(() => {
    obtenerNotas();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaNota(prev => ({ ...prev, [name]: value }));
  };

  // Crear nueva nota
  const crearNota = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notas', nuevaNota);
      setNuevaNota({ titulo: '', descripcion: '' });
      setMostrarFormulario(false);
      obtenerNotas(); // Refrescar la lista
    } catch (error) {
      console.error('Error al crear nota:', error);
    }
  };

  // Eliminar nota
  const eliminarNota = async (id) => {
    try {
      await api.delete(`/notas/${id}`);
      obtenerNotas(); // Refrescar la listas
    } catch (error) {
      console.error('Error al eliminar nota:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mis Notas</h1>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {mostrarFormulario ? 'Cancelar' : 'Nueva Nota'}
        </button>
      </div>

      {mostrarFormulario && (
        <form onSubmit={crearNota} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Crear Nueva Nota</h2>
          <div className="mb-4">
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={nuevaNota.titulo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={nuevaNota.descripcion}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Guardar Nota
            </button>
          </div>
        </form>
      )}

      {notas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-3 text-lg font-medium text-gray-700">No hay notas aún</h3>
          <p className="mt-1 text-gray-500">Crea tu primera nota haciendo clic en "Nueva Nota"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notas.map(nota => (
            <div key={nota.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">{nota.titulo}</h3>
                  <button
                    onClick={() => eliminarNota(nota.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Eliminar nota"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <p className="mt-2 text-gray-600 whitespace-pre-line">{nota.descripcion}</p>
                <p className="mt-3 text-xs text-gray-500">
                  Creada el: {new Date(nota.fecha_creacion).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
