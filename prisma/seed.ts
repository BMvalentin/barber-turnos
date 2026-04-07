import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client'

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: false,
  connectionLimit: 5,
  connectTimeout: 10000,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const dias = [
    'Lunes',
    'Martes',
    'Mieracoles',
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