import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@example.com' } })
  console.log('User found:', !!user)
  if (user) {
    console.log('Email:', user.email)
    console.log('Has Password:', !!user.password)
    console.log('TimeZone:', user.timeZone)
  }
  await prisma.$disconnect()
}

check()
