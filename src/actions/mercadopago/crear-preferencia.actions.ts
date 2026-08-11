"use server";

import { prisma } from "@/lib/prisma";
import { Preference } from "mercadopago";
import { obtenerClienteMP } from "@/lib/mercadopago/obtener-cliente";
import { requerirPropietarioOAdmin } from "@/lib/seguridad/requerir-propietario";
import { ZONA_HORARIA, ESTADOS_TURNO } from "@/lib/constants";
import type { ActionState } from "@/types/action-state";
import type { DatosPreferenciaPago } from "@/types/mercadopago";

/** Crea la preferencia de pago en Mercado Pago para la seña de un turno. */
export async function crearPreferenciaPago(turnoId: string): Promise<ActionState<DatosPreferenciaPago>> {
  try {
    if (!turnoId) return { success: false, error: "ID de turno inválido" };

    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      include: {
        user: { select: { name: true, email: true } },
        servicio: { select: { nombre: true, descripcion: true } },
        barbero: { select: { nombre: true } },
      },
    });
    if (!turno) return { success: false, error: "Turno no encontrado" };

    // Solo el dueño del turno (o un admin) puede generar su preferencia de pago
    const sesionAutorizada = await requerirPropietarioOAdmin(turno.userId);
    if (!sesionAutorizada) return { success: false, error: "No autorizado" };

    if (turno.estado === ESTADOS_TURNO[1]) return { success: false, error: "Este turno ya fue pagado" };
    if (turno.estado === ESTADOS_TURNO[3]) return { success: false, error: "Este turno está cancelado" };
    const seniaAmount = Number(turno.seniaCongelada);
    if (seniaAmount <= 0) return { success: false, error: "Este servicio no requiere seña" };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const isProduction = process.env.NODE_ENV === "production";
    const mp = await obtenerClienteMP();
    const preference = new Preference(mp);

    const body = {
      items: [
        {
          id: turnoId,
          title: `Seña - ${turno.servicio.nombre}`,
          description: `Turno con ${turno.barbero.nombre} | ${turno.horarioReservado.toLocaleString("es-AR", {
            timeZone: ZONA_HORARIA,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          quantity: 1,
          unit_price: seniaAmount,
          currency_id: "ARS",
        },
      ],
      payer: {
        name: turno.user.name ?? "Cliente",
        email: turno.user.email ?? "cliente@email.com",
      },
      back_urls: {
        success: `${baseUrl}/pago/success?turnoId=${turnoId}`,
        failure: `${baseUrl}/pago/failure?turnoId=${turnoId}`,
        pending: `${baseUrl}/pago/pending?turnoId=${turnoId}`,
      },
      // auto_return solo funciona con URLs públicas (no localhost): en producción lo activamos.
      ...(isProduction && { auto_return: "approved" as const }),
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      external_reference: turnoId,
      // Vence en 5 minutos para evitar que el usuario pague una seña vieja
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };

    const response = await preference.create({ body });
    if (!response.id) return { success: false, error: "No se pudo crear la preferencia de pago" };

    // Guardar el preference ID en el turno para tracking
    await prisma.turno.update({
      where: { id: turnoId },
      data: { mpPreferenceId: response.id },
    });

    return {
      success: true,
      data: {
        preferenceId: response.id,
        // Para producción se usa init_point, para sandbox sandbox_init_point
        checkoutUrl: response.init_point,
        initPoint: response.init_point,
        sandboxInitPoint: response.sandbox_init_point,
      },
    };
  } catch (error) {
    console.error("Error creando preferencia de pago:", error instanceof Error ? error.message : String(error));
    return { success: false, error: "No se pudo procesar el pago. Intentalo de nuevo." };
  }
}
