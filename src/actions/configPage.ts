// app/actions/config.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateWhatsappConfig(whatsapp: string) {
  const cleanNumber = whatsapp.replace(/\D/g, "");

  await prisma.pageConfig.upsert({
    where: { id: 1 },
    update: { whatsapp: cleanNumber },
    create: { id: 1, name: "Mi Barbería", whatsapp: cleanNumber },
  });
  
  revalidatePath("/admin/config");
  return { success: true };
}