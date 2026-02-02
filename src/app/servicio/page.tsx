import { getServicios } from "@/actions/servicio-actions";
import ServicioList from "@/components/servicio/ServicioList";
import CreateServicioForm from "@/components/servicio/CreateServicioForm";
import { Suspense } from "react";

export default async function ServiciosPage() {
    const result = await getServicios();

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Gestión de Servicios</h1>
                <p className="text-gray-600">
                    Administra los servicios disponibles para tus vehículos
                </p>
            </div>

            {/* Formulario de creación */}
            <div className="mb-8">
                <CreateServicioForm />
            </div>

            {/* Lista de servicios */}
            <Suspense fallback={<LoadingSkeleton />}>
                {result.success && result.data ? (
                    <ServicioList servicios={result.data} />
                ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">
                            {result.error || "Error al cargar los servicios"}
                        </p>
                    </div>
                )}
            </Suspense>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            ))}
        </div>
    );
}