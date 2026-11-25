import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { obtenerConfiguracionPush } from "@/lib/notificaciones/configuracion-push";
import { recordarTurnos } from "@/lib/notificaciones/recordar-turnos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function esCronAutorizado(req: Request): boolean {
  const secreto = process.env.CRON_SECRET;
  const autorizacion = req.headers.get("authorization");
  if (!secreto || !autorizacion) return false;

  const esperado = Buffer.from(`Bearer ${secreto}`);
  const recibido = Buffer.from(autorizacion);
  return esperado.length === recibido.length && timingSafeEqual(esperado, recibido);
}

export async function GET(req: Request) {
  if (!esCronAutorizado(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const configuracion = obtenerConfiguracionPush();
    if (!configuracion) {
      return NextResponse.json({ ok: true, habilitado: false });
    }

    const resultado = await recordarTurnos(new Date(), configuracion.publicKey);
    const ok = resultado.errores === 0 && resultado.reintentables === 0;
    return NextResponse.json({ ok, ...resultado }, { status: ok ? 200 : 503 });
  } catch {
    console.error("No se pudieron procesar los recordatorios de turnos.");
    return NextResponse.json({ error: "No se pudieron procesar los recordatorios" }, { status: 500 });
  }
}
