// components/admin/config/EncabezadoSeccion.tsx

interface EncabezadoSeccionProps {
    icono: React.ReactNode;
    titulo: string;
}

export default function EncabezadoSeccion({ icono, titulo }: EncabezadoSeccionProps) {
    return (
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            {icono}
            <h3 className="text-lg font-semibold text-white">{titulo}</h3>
        </div>
    );
}
