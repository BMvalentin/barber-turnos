// components/admin/config/BotonGuardar.tsx
import { elegirColorTexto } from "@/lib/contraste";

interface BotonGuardarProps {
    colorPrimario: string;
    colorSecundario: string;
    pendiente: boolean;
    deshabilitado: boolean;
}

export default function BotonGuardar({
    colorPrimario,
    colorSecundario,
    pendiente,
    deshabilitado,
}: BotonGuardarProps) {
    return (
        <button
            type="submit"
            disabled={pendiente || deshabilitado}
            className="w-full font-semibold py-3 rounded-lg transition-all disabled:opacity-50 shadow-md hover:opacity-95 text-base cursor-pointer"
            style={{
                backgroundColor: colorPrimario,
                color: elegirColorTexto(colorPrimario),
                border: `1px solid ${colorSecundario}`,
            }}
        >
            {pendiente ? "Guardando..." : "Guardar Cambios"}
        </button>
    );
}