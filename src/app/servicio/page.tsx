import { getServicios } from "@/actions/servicio-actions";
import { getBarberos } from "@/actions/barbero.actions";
import ServicioList from "@/components/servicio/ServicioList";
import CreateServicioForm from "@/components/servicio/CreateServicioForm";

export default async function ServiciosPage() {
    const [resultServicios, resultBarberos] = await Promise.all([
        getServicios(),
        getBarberos()
    ]);
    
    const servicios = resultServicios.success ? resultServicios.data : [];
    const barberos = resultBarberos.success ? resultBarberos.data : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Gestión de Servicios</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario de creación */}
                <div className="lg:col-span-1">
                    <CreateServicioForm barberos={barberos} />
                </div>

                {/* Lista de servicios */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-semibold mb-4">Servicios Registrados</h2>
                    <ServicioList servicios={servicios} barberos={barberos} />
                </div>
            </div>
        </div>
    );
}