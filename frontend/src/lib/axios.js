// src/lib/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; // Asegúrate de que esta línea esté exactamente así