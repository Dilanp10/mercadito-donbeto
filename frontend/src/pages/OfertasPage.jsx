import CrearOferta from "../components/Ofertas/CrearOferta";
import ListaOfertas from "../components/Ofertas/ListaOfertas";

export default function OfertasPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Ofertas</h1>
      <CrearOferta />
      <ListaOfertas />
    </div>
  );
}