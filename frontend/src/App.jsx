import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InventarioPage from "./pages/InventarioPage";
import NuevoProducto from "./pages/NuevoProducto";
import EditarProducto from "./pages/EditarProducto";
import { InventarioProvider } from "./context/InventarioContext";
import HistorialVentas from './pages/HistorialVentas';
import VentasPage from "./pages/VentasPage";
import NavBar from './components/Navbar/NavBar';
import CuentasPage from './pages/CuentasPage';
import DetalleCuenta from './pages/DetalleCuenta';
import Notas from "./pages/notas";
import OfertasPage from "./pages/OfertasPage";

function App() {
  return (
    <InventarioProvider>
      
      <Router>
        <div className="min-h-screen bg-gray-50 p-4">
        <NavBar />
          <Routes>
            <Route path="/" element={<InventarioPage />} />
            <Route path="/inventario" element={<InventarioPage />} />
            <Route path="/nuevo-producto" element={<NuevoProducto />} />
            <Route path="/editar-producto/:id" element={<EditarProducto />} />
            <Route path="/historial" element={<HistorialVentas />} />
            <Route path="/ventas" element={<VentasPage/>} />
            <Route path="/Cuentas" element={<CuentasPage />} />
            {/* <Route path="/cuentas/nueva" element={<FormularioCrearCuenta />} /> */}
            <Route path="/cuentas/:id" element={<DetalleCuenta />} />
            <Route path="/notas" element={<Notas />} />
            <Route path="/oferta" element={<OfertasPage/>} />

          </Routes>
        </div>
      </Router>
    </InventarioProvider>
  );
}

export default App;