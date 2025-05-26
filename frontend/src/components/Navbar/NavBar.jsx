import { Link, useLocation } from 'react-router-dom';

export default function NavBar() {
  const { pathname } = useLocation();

  const linkStyle = (path) =>
    `px-4 py-2 rounded-md font-medium transition duration-150 ${
      pathname === path ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
    }`;

  return (
    <nav className="bg-white shadow-sm mb-6">
      <div className="container mx-auto px-4 py-3 flex gap-4">
        <Link to="/" className={linkStyle('/')}>Inventario</Link>
        <Link to="/nuevo-producto" className={linkStyle('/nuevo-producto')}>Nuevo Producto</Link>
        <Link to="/ventas" className={linkStyle('/ventas')}>Ventas</Link>
        <Link to="/historial" className={linkStyle('/historial')}>Historial</Link>
        <Link to="/cuentas" className={linkStyle('/Cuentas')}>Cuentas</Link>
        <Link to="/notas" className={linkStyle('/notas')}>notas</Link>
        <Link to="/oferta" className={linkStyle('/oferta')}>ofertas</Link>


      </div>
    </nav>
  );
}