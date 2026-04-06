// app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import { Users, Scissors, Calendar, DollarSign, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const hoy = new Date();
  const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
  const finDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

  const [
    totalBarberos, 
    totalServicios, 
    totalTurnos, 
    turnosPendientes,
    barberos,
    proximosTurnos,
    serviciosPopulares,
    turnosHoyPorBarbero
  ] = await Promise.all([
    prisma.barbero.count({ where: { estado: true } }),
    prisma.servicio.count({ where: { estado: true } }),
    prisma.turno.count(),
    prisma.turno.count({ where: { estado: "PENDIENTE" } }),
    
    prisma.barbero.findMany({
      where: { estado: true },
      select: {
        id: true,
        nombre: true,
        srcImage: true,
        _count: {
          select: {
            turnos: { where: { estado: "PENDIENTE" } }
          }
        }
      },
      orderBy: { nombre: "asc" },
      take: 5
    }),

    prisma.turno.findMany({
      where: {
        estado: "PENDIENTE",
        horarioReservado: { gte: new Date() }
      },
      include: {
        user: { select: { name: true, email: true } },
        barbero: { select: { nombre: true } },
        servicio: { select: { nombre: true } }
      },
      orderBy: { horarioReservado: "asc" },
      take: 5
    }),

    prisma.servicio.findMany({
      where: { estado: true },
      select: {
        id: true,
        nombre: true,
        precio: true,
        _count: { select: { turnos: true } }
      },
      orderBy: { turnos: { _count: "desc" } },
      take: 5
    }),

    prisma.barbero.findMany({
      where: { estado: true },
      include: {
        turnos: {
          where: {
            horarioReservado: { gte: inicioDia, lte: finDia },
            estado: "PENDIENTE"
          },
          include: {
            user: { select: { name: true, email: true } },
            servicio: { select: { nombre: true, duracion: true } }
          },
          orderBy: { horarioReservado: "asc" }
        }
      },
      orderBy: { nombre: "asc" }
    })
  ]);

  return { 
    totalBarberos, 
    totalServicios, 
    totalTurnos, 
    turnosPendientes,
    barberos,
    proximosTurnos,
    serviciosPopulares,
    turnosHoyPorBarbero
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-amber-950/30 p-6">
      <div className="max-w-7xl mx-auto space-y-10 mt-10">

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Barberos" value={stats.totalBarberos} icon={Users} href="/barbero" />
          <StatCard title="Servicios" value={stats.totalServicios} icon={Scissors} href="/servicio" />
          <StatCard title="Total Turnos" value={stats.totalTurnos} icon={Calendar} href="/turno" />
          <StatCard title="Pendientes" value={stats.turnosPendientes} icon={DollarSign} href="/turno" />
        </div>

        {/* DETALLE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <DetailCard title="Próximos Turnos" icon={Calendar}>
            {stats.proximosTurnos.length === 0 ? (
              <Empty text="No hay turnos próximos" />
            ) : (
              stats.proximosTurnos.map((t) => (
                <Item key={t.id}>
                  <p className="text-white text-sm">{t.user.name || t.user.email}</p>
                  <p className="text-amber-200/60 text-xs">{t.servicio.nombre}</p>
                  <p className="text-amber-200/50 text-xs">{t.barbero.nombre}</p>
                </Item>
              ))
            )}
          </DetailCard>

          <DetailCard title="Barberos" icon={Users}>
            {stats.barberos.length === 0 ? (
              <Empty text="No hay barberos" />
            ) : (
              stats.barberos.map((b) => (
                <Item key={b.id}>
                  <p className="text-white text-sm">{b.nombre}</p>
                  <p className="text-amber-200/60 text-xs">{b._count.turnos} pendientes</p>
                </Item>
              ))
            )}
          </DetailCard>

          <DetailCard title="Servicios" icon={Scissors}>
            {stats.serviciosPopulares.length === 0 ? (
              <Empty text="No hay servicios" />
            ) : (
              stats.serviciosPopulares.map((s) => (
                <Item key={s.id}>
                  <p className="text-white text-sm">{s.nombre}</p>
                  <p className="text-amber-200/60 text-xs">{s._count.turnos} usos</p>
                </Item>
              ))
            )}
          </DetailCard>

        </div>

        {/* AGENDA */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Clock className="text-amber-500" />
            <h2 className="text-2xl font-bold text-white">Agenda de Hoy</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats.turnosHoyPorBarbero
              .filter(b => b.turnos.length > 0)
              .map((b) => (
                <div key={b.id} className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl p-5">
                  <h3 className="text-white font-bold mb-3">{b.nombre}</h3>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {b.turnos.map((t) => (
                      <div key={t.id} className="bg-black/60 border border-amber-900/30 p-3 rounded-lg">
                        <p className="text-white text-sm">{t.user.name}</p>
                        <p className="text-amber-200/60 text-xs">{t.servicio.nombre}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* COMPONENTES */

function StatCard({ title, value, icon: Icon, href }: any) {
  return (
    <Link href={href}>
      <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl p-6 hover:border-amber-500/50 transition group">
        <div className="flex justify-between">
          <div>
            <p className="text-amber-200/70 text-sm">{title}</p>
            <p className="text-3xl text-white font-bold">{value}</p>
          </div>
          <Icon className="text-amber-500" />
        </div>
      </div>
    </Link>
  );
}

function DetailCard({ title, icon: Icon, children }: any) {
  return (
    <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="text-amber-500" />
        <h2 className="text-white font-bold">{title}</h2>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Item({ children }: any) {
  return (
    <div className="p-3 bg-black/60 border border-amber-900/30 rounded-lg hover:border-amber-500/50 transition">
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="text-center text-amber-200/50 py-6 text-sm">{text}</p>
  );
}