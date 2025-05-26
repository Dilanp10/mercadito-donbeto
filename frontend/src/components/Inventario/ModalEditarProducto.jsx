import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { useInventario } from '../context/InventarioContext';

export default function ModalEditarProducto({ producto, isOpen, onClose }) {
  const { actualizarProducto, eliminarProducto } = useInventario();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      stock: producto.stock,
      fechaVencimiento: producto.fecha_vencimiento?.slice(0, 10),
    }
  });

  const onSubmit = async (data) => {
    await actualizarProducto(producto.id, data);
    onClose();
  };

  const handleEliminar = async () => {
    if (confirm('¿Estás seguro que deseas eliminar este producto?')) {
      await eliminarProducto(producto.id);
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <Dialog.Title className="text-xl font-bold text-gray-800">
                Editar Producto
              </Dialog.Title>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input
                  {...register('nombre', { required: true })}
                  className="w-full border rounded p-2"
                  placeholder="Nombre"
                />
                {errors.nombre && <p className="text-red-500 text-sm">Nombre requerido</p>}

                <select
                  {...register('categoria', { required: true })}
                  className="w-full border rounded p-2"
                >
                  <option value="">Selecciona categoría</option>
                  <option value="gaseosas">Gaseosas</option>
                  <option value="alimentos">Alimentos</option>
                  <option value="bazar">Bazar</option>
                  <option value="carniceria">Carnicería</option>
                  <option value="limpieza">Limpieza</option>
                </select>

                <input
                  type="number"
                  step="0.01"
                  {...register('precio', { required: true, min: 0.01 })}
                  className="w-full border rounded p-2"
                  placeholder="Precio"
                />
                <input
                  type="number"
                  {...register('stock', { required: true, min: 0 })}
                  className="w-full border rounded p-2"
                  placeholder="Stock"
                />
                <input
                  type="date"
                  {...register('fechaVencimiento', { required: true })}
                  className="w-full border rounded p-2"
                />

                <div className="flex justify-between mt-6">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={handleEliminar}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </form>

              <button
                onClick={onClose}
                className="absolute top-2 right-3 text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}