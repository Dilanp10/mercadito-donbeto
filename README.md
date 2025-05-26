# Mercadito Don Beto

**Mercadito Don Beto** es una aplicación de gestión para un pequeño negocio de almacén ("mercadito") desarrollada con **frontend en React 18, Vite y Tailwind CSS 3** y **backend en Node.js con SQLite** (usando **better-sqlite3**). La aplicación está diseñada para operar offline y permite manejar inventario, ventas, notas, crear ofertas, historial de transacciones y gestión de cuentas de clientes.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Licencia](#-licencia)

---

## 🎯 Características

- **Gestión de Inventario**: Listado de productos, filtros por categoría, stock mínimo y alerta de bajos stock.
- **Ingreso de Productos**: Formulario con validación (React Hook Form + Zod) para agregar y editar productos.
- **Procesamiento de Ventas**: Registrar ventas, impresión de tickets (soporte offline) y cálculo de totales.
- **Historial de Transacciones**: Visualizar ventas anteriores y detalle de cada operación.
- **Módulo de Cuentas**: Crear y buscar cuentas de clientes, ver historial de compras por cuenta y agregar ventas a cuenta sin calcular vuelto ni método de pago.
- **Notificaciones**: Mensajes tipo toast para feedback (react-hot-toast).
- **UI/UX**: Componentes reutilizables con HeadlessUI, Heroicons y estilos con Tailwind CSS.
- **Estado Global**: Manejo de estado con Context API.

---

## 🛠 Tecnologías

**Frontend**:

- React 18 + Vite
- Tailwind CSS 3
- React Router DOM v6
- React Hook Form + Zod
- HeadlessUI & Heroicons
- react-hot-toast
- Context API

**Backend**:

- Node.js + Express
- SQLite (better-sqlite3)
- Estructura modular (routes, controllers, repositories)

**Herramientas**:

- npm
- Postman (para pruebas de API)

---

## ⚙️ Instalación

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/Dilanp10/mercadito-donbeto.git
   cd mercadito-donbeto
Configurar y levantar el backend:

bash
Copiar
Editar
cd backend
npm install
# Ajustar configuración de la base de datos en db/config si aplica
node server.js
Configurar y levantar el frontend:

bash
Copiar
Editar
cd ../frontend
npm install
npm run dev
Abrir el cliente en el navegador: http://localhost:5173 (o el puerto que indique la consola).

🚀 Uso
Navegar entre las secciones de Inventario, Ventas, Historial, Ofertas y Cuentas desde el menú principal.

Crear, editar y eliminar productos.

Registrar nuevas ventas o ventas a cuenta.

Consultar historial detallado de operaciones.

Dejar notas.

Crear ofertas.

© 2025 Mercadito Don Beto. Todos los derechos reservados.

Copiar
Editar
