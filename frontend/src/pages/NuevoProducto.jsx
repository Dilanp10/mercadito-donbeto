import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useInventario } from "../context/InventarioContext";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';

const categorias = ['gaseosas', 'alimentos', 'bazar', 'carniceria', 'limpieza'];

const productoSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(30, "Máximo 30 caracteres"),
  categoria: z.enum(categorias, { message: "Selecciona una categoría válida" }),
  precio: z.number({ invalid_type_error: "Debe ser un número" })
           .min(0.01, "Mínimo $0.01").max(9999.99, "Máximo $9999.99"),
  stock: z.number({ invalid_type_error: "Debe ser un número entero" })
          .int("Debe ser un número entero").min(1, "Mínimo 1 unidad"),
  fechaIngreso: z.string(),
  fechaVencimiento: z.string(),
});

export default function NuevoProducto() {
  const { agregarProducto } = useInventario();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      fechaIngreso: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate("/inventario", { replace: true });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const onSubmit = async (data) => {
    try {
      await agregarProducto(data);
      toast.success('Producto guardado con éxito');
      reset();
      setIsSuccess(true);
    } catch (error) {
      toast.error('Error al guardar el producto');
      console.error("Error detallado:", error);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md"
      >
        <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Nuevo Producto</h1>
        <br></br>
        <div className="space-y-4">
          {/* Campo Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              {...register("nombre")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del producto"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
            )}
          </div>

          {/* Campo Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              {...register("categoria")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.categoria && (
              <p className="mt-1 text-sm text-red-600">{errors.categoria.message}</p>
            )}
          </div>

          {/* Campo Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
            <input
              type="number"
              step="0.01"
              {...register("precio", { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
            {errors.precio && (
              <p className="mt-1 text-sm text-red-600">{errors.precio.message}</p>
            )}
          </div>

          {/* Campo Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              {...register("stock", { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cantidad en stock"
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
            )}
          </div>

          {/* Campo Fecha Ingreso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso</label>
            <input
              type="date"
              {...register("fechaIngreso")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
          </div>

          {/* Campo Fecha Vencimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
            <input
              type="date"
              {...register("fechaVencimiento")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.fechaVencimiento && (
              <p className="mt-1 text-sm text-red-600">{errors.fechaVencimiento.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
        </button>
      </form>
    </div>
  );
}