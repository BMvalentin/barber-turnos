// app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import { Users, Scissors, Calendar, DollarSign, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const [
    totalBarberos, 
    totalServicios, 
    totalTurnos, 
    turnosPendientes,
    barberos,
    proximosTurnos,
    serviciosPopulares
  ] = await Promise.all([
    prisma.barbero.count({ where: { estado: true } }),
    prisma.servicio.count({ where: { estado: true } }),
    prisma.turno.count(),
    prisma.turno.count({ where: { estado: "PENDIENTE" } }),
    
    // Barberos con más info
    prisma.barbero.findMany({
      where: { estado: true },
      select: {
        id: true,
        nombre: true,
        srcImage: true,
        _count: {
          select: {
            turnos: {
              where: { estado: "PENDIENTE" }
            }
          }
        }
      },
      orderBy: { nombre: "asc" },
      take: 5
    }),

    // Próximos turnos
    prisma.turno.findMany({
      where: {
        estado: "PENDIENTE",
        horarioReservado: {
          gte: new Date()
        }
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        barbero: {
          select: { nombre: true }
        },
        servicio: {
          select: { nombre: true }
        }
      },
      orderBy: { horarioReservado: "asc" },
      take: 5
    }),

    // Servicios más solicitados
    prisma.servicio.findMany({
      where: { estado: true },
      select: {
        id: true,
        nombre: true,
        precio: true,
        _count: {
          select: {
            turnos: true
          }
        }
      },
      orderBy: {
        turnos: {
          _count: "desc"
        }
      },
      take: 5
    })
  ]);

  return { 
    totalBarberos, 
    totalServicios, 
    totalTurnos, 
    turnosPendientes,
    barberos,
    proximosTurnos,
    serviciosPopulares
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Barberos"
          value={stats.totalBarberos}
          icon={Users}
          color="blue"
          href="/barbero"
        />
        <StatCard
          title="Servicios"
          value={stats.totalServicios}
          icon={Scissors}
          color="green"
          href="/servicio"
        />
        <StatCard
          title="Total Turnos"
          value={stats.totalTurnos}
          icon={Calendar}
          color="purple"
          href="/turno"
        />
        <StatCard
          title="Turnos Pendientes"
          value={stats.turnosPendientes}
          icon={DollarSign}
          color="amber"
          href="/turno"
        />
      </div>

      {/* Información Detallada */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Próximos Turnos */}
        <DetailCard
          title="Próximos Turnos"
          icon={Calendar}
          color="blue"
        >
          {stats.proximosTurnos.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No hay turnos próximos</p>
          ) : (
            <div className="space-y-3">
              {stats.proximosTurnos.map((turno) => (
                <div key={turno.id} className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-white">
                        {turno.user.name || turno.user.email}
                      </p>
                      <p className="text-xs text-gray-300 mt-1">
                        {turno.servicio.nombre}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Barbero: {turno.barbero.nombre}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-orange-500">
                        {new Date(turno.horarioReservado).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short'
                        })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(turno.horarioReservado).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DetailCard>

        {/* Barberos */}
        <DetailCard
          title="Barberos Activos"
          icon={Users}
          color="green"
        >
          {stats.barberos.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No hay barberos</p>
          ) : (
            <div className="space-y-3">
              {stats.barberos.map((barbero) => (
                <div key={barbero.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700">
                  <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                    {barbero.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-white">{barbero.nombre}</p>
                    <p className="text-xs text-gray-400">
                      {barbero._count.turnos} turnos pendientes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DetailCard>

        {/* Servicios Populares */}
        <DetailCard
          title="Servicios Populares"
          icon={Scissors}
          color="purple"
        >
          {stats.serviciosPopulares.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No hay servicios</p>
          ) : (
            <div className="space-y-3">
              {stats.serviciosPopulares.map((servicio) => (
                <div key={servicio.id} className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-white">{servicio.nombre}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {servicio._count.turnos} reservas
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-orange-500">
                      ${servicio.precio.toString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DetailCard>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  href 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  color: "blue" | "green" | "purple" | "amber";
  href: string;
}) {
  const colorClasses = {
    blue: "bg-orange-500/20 text-orange-500 group-hover:bg-orange-500/30",
    green: "bg-orange-500/20 text-orange-500 group-hover:bg-orange-500/30",
    purple: "bg-orange-500/20 text-orange-500 group-hover:bg-orange-500/30",
    amber: "bg-orange-500/20 text-orange-500 group-hover:bg-orange-500/30",
  };

  return (
    <Link href={href}>
      <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6 hover:shadow-xl hover:border-orange-500/50 transition-all cursor-pointer group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 font-medium">{title}</p>
            <p className="text-3xl font-bold mt-2 text-white">{value}</p>
          </div>
          <div className={`p-3 rounded-lg transition-colors ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-gray-500 group-hover:text-orange-500 transition-colors">
          Ver detalles
          <ChevronRight className="h-4 w-4 ml-1" />
        </div>
      </div>
    </Link>
  );
}

function DetailCard({ 
  title, 
  icon: Icon, 
  color,
  children 
}: { 
  title: string; 
  icon: any; 
  color: "blue" | "green" | "purple";
  children: React.ReactNode;
}) {
  const colorClasses = {
    blue: "text-orange-500",
    green: "text-orange-500",
    purple: "text-orange-500",
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${colorClasses[color]}`} />
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}