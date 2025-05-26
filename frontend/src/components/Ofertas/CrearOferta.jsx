import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../lib/axios";

export default function CrearOferta() {
  const [productos, setProductos] = useState([]);
  const [productoId, setProductoId] = useState("");
  const [cantidadMinima, setCantidadMinima] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState(""); 

  useEffect(() => {
    api.get("/productos")
      .then(res => setProductos(res.data))
      .catch(() => toast.error("Error al cargar productos"));
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    if (!productoId || !cantidadMinima || !precioUnitario) {
      return toast.error("Todos los campos son obligatorios");
    }

    const nuevaOferta = {
      producto_id: Number(productoId),
      cantidad_minima: Number(cantidadMinima),
      precio_unitario: Number(precioUnitario)      //  enviamos unitario
    };

    api.post("/ofertas", nuevaOferta)
      .then(response => {
        if (response.data.success) {
          toast.success("Oferta creada exitosamente!");
          setProductoId("");
          setCantidadMinima("");
          setPrecioUnitario("");
        } else {
          toast.error(`Error: ${response.data.error}`);
          console.error("Detalles del error:", response.data.details);
        }
      })
      .catch(error => {
        const message = error.response?.data?.error || "Error desconocido";
        toast.error(`Error: ${message}`);
        console.error("Detalles técnicos:", error.response?.data?.details);
      });
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4 bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold">Crear nueva oferta</h2>

      <div>
        <label className="block text-sm font-medium">Producto</label>
        <select
          className="w-full border rounded p-2"
          value={productoId}
          onChange={e => setProductoId(e.target.value)}
          required
        >
          <option value="">Seleccionar producto</option>
          {productos.map(p => (
            <option key={p.id} value={p.id}>
              {p.nombre} (Stock: {p.stock})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Cantidad mínima</label>
        <input
          type="number"
          className="w-full border rounded p-2"
          value={cantidadMinima}
          onChange={e => setCantidadMinima(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Precio por unidad</label> 
        <input
          type="number"
          step="0.01"
          className="w-full border rounded p-2"
          value={precioUnitario}
          onChange={e => setPrecioUnitario(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="mt-6  bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        Crear Oferta
      </button>
    </form>
  );
}