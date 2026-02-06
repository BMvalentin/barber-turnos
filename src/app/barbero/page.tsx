import { getBarberos } from "@/actions/barbero.actions";
import BarberoList from "@/components/barbero/BarberoList";
import CreateBarberoForm from "@/components/barbero/CreateBarberoForm";

export default async function BarberosPage() {
    const result = await getBarberos();
    const barberos = result.success ? result.data : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Gestión de Barberos</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario de creación */}
                <div className="lg:col-span-1">
                    <CreateBarberoForm />
                </div>

                {/* Lista de barberos */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-semibold mb-4">Barberos Registrados</h2>
                    <BarberoList barberos={barberos} />
                </div>
            </div>
        </div>
    );
}