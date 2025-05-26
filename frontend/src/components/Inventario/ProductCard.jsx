import { useNavigate } from "react-router-dom";
import { PencilIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button"; // Asegurate que tenés el botón

export default function ProductCard({ producto }) {
  const navigate = useNavigate();

  const { nombre, categoria, precio } = producto;

  return (
    <div className="p-4 rounded-2xl shadow bg-white space-y-2 border relative">
      <div className="text-lg font-semibold text-gray-800">{nombre}</div>
      <div className="text-sm text-gray-500">${precio.toFixed(2)}</div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-xs uppercase px-2 py-1 bg-gray-200 rounded-full inline-block">
          {categoria}
        </span>
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("ID seleccionado para editar:", producto.id);
            navigate(`/editar-producto/${producto.id}`);
          }}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full relative z-30"
        >
          <PencilIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}