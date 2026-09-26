import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const school = await prisma.school.create({
    data: {
      name: 'Test School',
      email: 'admin@testschool.com',
    }
  })

  const passwordHash = await bcrypt.hash('password123', 10)

  await prisma.user.create({
    data: {
      schoolId: school.id,
      name: 'Test Admin',
      phone: '0700000000',
      passwordHash,
      role: 'SCHOOL_ADMIN',
    }
  })

  console.log('Seeded successfully')
  console.log('schoolId:', school.id)
  console.log('phone: 0700000000')
  console.log('password: password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())