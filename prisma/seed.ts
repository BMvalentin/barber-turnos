import 'dotenv/config'
import { prisma } from '@/lib/prisma'

async function main() {
  const dias = [
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
    'Domingo',
  ] as const

  for (const dia of dias) {
    await prisma.dia_laboral.create({
      data: {
        dia,
        estado: true,
      },
    })
  }

  console.log('✅ Días laborales creados')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
