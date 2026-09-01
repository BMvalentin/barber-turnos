import { getBarberos } from "@/actions/barberos/listar.actions";
import { FeriadosYCierresCliente } from "@/componentes/panel/horarios/feriados-y-cierres/feriados-y-cierres-cliente";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { prisma } from "@/lib/prisma";

export default async function FeriadosYCierresPage() {
  const [excepciones, respuestaBarberos] = await Promise.all([
    prisma.excepcion_laboral.findMany({
      where: { estado: true },
      include: {
        barbero: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { desde: "desc" },
    }),
    getBarberos(),
  ]);
  const barberos = respuestaBarberos.success ? (respuestaBarberos.data ?? []) : [];

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { etiqueta: "Configuración", href: "/admin/config" },
          { etiqueta: "Horarios", href: "/admin/config/empleados/horarios-laborales" },
          { etiqueta: "Feriados y excepciones" },
        ]}
      />
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-texto-primario)] md:text-[28px]">
          Feriados y cierres
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
          Definí los días o rangos en los que la barbería o un profesional no atienden.
        </p>
      </section>
      <FeriadosYCierresCliente excepciones={excepciones} barberos={barberos} />
    </div>
  );
}
