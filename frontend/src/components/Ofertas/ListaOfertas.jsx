import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/axios";

export default function ListaOfertas() {
  const [ofertas, setOfertas] = useState([]);

  useEffect(() => {
    api.get("/ofertas")
      .then(res => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setOfertas(res.data.data);
        } else {
          toast.error("Formato de datos inesperado al cargar ofertas");
        }
      })
      .catch(() => toast.error("Error al cargar las ofertas"));
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Ofertas actuales</h2>
      {ofertas.length === 0 ? (
        <p>No hay ofertas cargadas.</p>
      ) : (
        <ul className="space-y-2">
          {ofertas.map(oferta => {
            const precioUnitario = oferta.precio_total / oferta.cantidad_minima;
            return (
              <li
                key={oferta.id}
                className="border p-2 rounded bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <strong>{oferta.nombre_producto || oferta.producto_nombre}</strong><br />
                  Llevando al menos <strong>{oferta.cantidad_minima}</strong>, cada unidad cuesta <strong>${precioUnitario.toFixed(2)}</strong>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}