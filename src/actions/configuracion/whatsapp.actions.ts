"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";

async function updateWhatsappConfigBase(whatsapp: string) {
  const cleanNumber = whatsapp.replace(/\D/g, "");

  await prisma.pageConfig.upsert({
    where: { id: 1 },
    update: { whatsapp: cleanNumber },
    create: { id: 1, name: "Mi Barbería", whatsapp: cleanNumber },
  });

  revalidateTag("page-config");
  revalidatePath("/admin/config");
  return { success: true };
}

export const updateWhatsappConfig = exigirAdmin(updateWhatsappConfigBase);
