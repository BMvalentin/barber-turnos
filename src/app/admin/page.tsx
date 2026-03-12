// app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import { Users, Scissors, Calendar, DollarSign, Plus } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const [totalBarberos, totalServicios, totalTurnos, turnosPendientes] = await Promise.all([
    prisma.barbero.count({ where: { estado: true } }),
    prisma.servicio.count({ where: { estado: true } }),
    prisma.turno.count(),
    prisma.turno.count({ where: { estado: "PENDIENTE" } }),
  ]);

  return { totalBarberos, totalServicios, totalTurnos, turnosPendientes };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8 mt-16">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Resumen general de la barbería</p>
      </div>

      {/* Layout Grid: Acciones Rápidas (Izquierda) + Stats (Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Acciones Rápidas - Izquierda */}
        <div className="lg:col-span-1" >
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-3">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Acciones Rápidas
            </h2>
            
            <QuickActionButton href="/barbero" label="Nuevo Barbero" icon={Users} />
            <QuickActionButton href="/servicio" label="Nuevo Servicio" icon={Scissors} />
            <QuickActionButton href="/turno" label="Nuevo Turno" icon={Calendar} />
          </div>
        </div>

        {/* Stats Cards - Derecha */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Barberos"
            value={stats.totalBarberos}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Servicios"
            value={stats.totalServicios}
            icon={Scissors}
            color="green"
          />
          <StatCard
            title="Total Turnos"
            value={stats.totalTurnos}
            icon={Calendar}
            color="purple"
          />
          <StatCard
            title="Turnos Pendientes"
            value={stats.turnosPendientes}
            icon={DollarSign}
            color="amber"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  color: "blue" | "green" | "purple" | "amber";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ 
  href, 
  label, 
  icon: Icon 
}: { 
  href: string; 
  label: string; 
  icon: any;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 w-full p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all font-medium text-gray-700 hover:text-blue-700"
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}