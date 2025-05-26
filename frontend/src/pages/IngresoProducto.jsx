// src/pages/IngresoProducto.jsx
import api from '../lib/axios';
import { toast } from 'react-hot-toast';

function onSubmit(data) {
  api.post('/productos', data)
    .then((res) => {
      toast.success('Producto creado');
      // Aquí podrías actualizar productos localmente o redireccionar
    })
    .catch((err) => {
      console.error(err);
      toast.error('Error al crear producto');
    });
}