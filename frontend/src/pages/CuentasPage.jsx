import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../lib/axios';

export default function CuentasPage() {
  const [cuentas, setCuentas] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarCuentas();
  }, []);

  const cargarCuentas = async () => {
    try {
      const res = await axios.get('/cuentas');
      console.log('Respuesta de /cuentas:', res.data);

      const datos = res.data.data; //accedemos al arreglo

      if (Array.isArray(datos)) {
        setCuentas(datos);
      } else {
        console.error('La propiedad "data" no contiene un arreglo:', res.data);
        setCuentas([]);
      }
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
    }
  };

  const eliminarCuenta = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) {
      return;
    }

    try {
      await axios.delete(`/cuentas/${id}`);
      cargarCuentas();
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);
      alert('No se pudo eliminar la cuenta');
    }
  };

  const cuentasFiltradas = cuentas.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cuentas de Clientes</h1>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <Link to="/cuentas/nueva" className=" bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
          + Nueva Cuenta
        </Link>
      </div>

      <ul className="space-y-2">
        {cuentasFiltradas.map((c) => (
          <li
            key={c.id}
            className="border p-3 rounded shadow-sm flex justify-between items-center"
          >
            <Link
              to={`/cuentas/${c.id}`}
              className="font-semibold text-blue-700 hover:underline flex-1"
            >
              {c.nombre}
            </Link>
            <button
              onClick={() => eliminarCuenta(c.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2"
              title="Eliminar cuenta"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}