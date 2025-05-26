// src/components/Ingreso/FormularioIngreso.jsx
import { useForm } from "react-hook-form";
import { useContext } from "react";
import { InventarioContext } from "../../context/InventarioContext";
import { format } from "date-fns";

const categorias = ["gaseosas", "alimentos", "bazar", "carniceria", "limpieza"];

export default function FormularioIngreso() {
  const { agregarProducto } = useContext(InventarioContext);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const fechaIngreso = new Date();
  const fechaIngresoFormateada = format(fechaIngreso, "yyyy-MM-dd");

  const onSubmit = (data) => {
    agregarProducto({
      ...data,
      precio: parseFloat(data.precio),
      stock: parseInt(data.stock),
      fechaIngreso: fechaIngresoFormateada,
      fechaVencimiento: data.fechaVencimiento,
    });
  };

  const nombreIngresado = watch("nombre");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-white rounded-2xl shadow max-w-lg mx-auto">
      <div>
        <label className="block font-medium">Nombre del producto</label>
        <input
          type="text"
          {...register("nombre", { required: true, minLength: 2, maxLength: 30 })}
          className="input input-bordered w-full"
          placeholder="Ej: Coca-Cola"
        />
        {errors.nombre && <p className="text-red-500 text-sm">Nombre inválido</p>}
      </div>

      <div>
        <label className="block font-medium">Categoría</label>
        <select {...register("categoria", { required: true })} className="select select-bordered w-full">
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium">Precio</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          max="9999.99"
          {...register("precio", { required: true })}
          className="input input-bordered w-full"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block font-medium">Stock</label>
        <input
          type="number"
          {...register("stock", { required: true, min: 1 })}
          className="input input-bordered w-full"
          placeholder="Ej: 10"
        />
      </div>

      <div>
        <label className="block font-medium">Fecha de vencimiento</label>
        <input
          type="date"
          {...register("fechaVencimiento", {
            required: true,
            validate: (value) => new Date(value) > fechaIngreso,
          })}
          className="input input-bordered w-full"
        />
        {errors.fechaVencimiento && <p className="text-red-500 text-sm">Debe ser posterior a hoy</p>}
      </div>

      <button type="submit" className="btn btn-primary w-full">Agregar Producto</button>
    </form>
  );
}