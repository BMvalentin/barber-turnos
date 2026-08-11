// components/admin/config/SeccionColores.tsx
import { Palette } from "lucide-react";
import { elegirColorTexto, calcularRazonDeContraste } from "@/lib/contraste";
import CampoColor from "@/components/admin/config/CampoColor";
import EncabezadoSeccion from "@/components/admin/config/EncabezadoSeccion";
import type { ManejarCambio } from "@/components/admin/config/tipos";

interface SeccionColoresProps {
    colorPrimario: string;
    colorSecundario: string;
    borde: React.CSSProperties;
    manejarCambio: ManejarCambio;
    colorIcono: string;
}

export default function SeccionColores({
    colorPrimario,
    colorSecundario,
    borde,
    manejarCambio,
    colorIcono,
}: SeccionColoresProps) {
    const colorTexto = elegirColorTexto(colorPrimario);
    const razonContraste = calcularRazonDeContraste(colorPrimario, colorTexto);

    return (
        <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4 shadow-lg">
            <EncabezadoSeccion
                icono={<Palette className="w-5 h-5" style={{ color: colorIcono }} />}
                titulo="Diseño y Colores"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CampoColor
                    nombre="primaryColor"
                    etiqueta="Color Primario"
                    valor={colorPrimario}
                    borde={borde}
                    manejarCambio={manejarCambio}
                />
                <CampoColor
                    nombre="secondaryColor"
                    etiqueta="Color Secundario"
                    valor={colorSecundario}
                    borde={borde}
                    manejarCambio={manejarCambio}
                />
            </div>

            {/* Preview de contraste del color primario */}
            <div className="p-4 rounded-xl border border-amber-900/30 bg-black/40">
                <div className="flex items-center gap-4">
                    <div
                        className="w-16 h-16 rounded-xl border border-white/10 flex items-center justify-center text-2xl font-black"
                        style={{ backgroundColor: colorPrimario, color: colorTexto }}
                    >
                        Aa
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-white">
                            {colorTexto === "#09090b"
                                ? "Texto oscuro sobre este fondo"
                                : "Texto claro sobre este fondo"}
                        </p>
                        <p className="text-xs text-amber-200/60 mt-1">
                            Contraste {razonContraste.toFixed(1)}
                            :1 {razonContraste >= 4.5 ? "· cumple WCAG AA" : "· no alcanza WCAG AA"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}