/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const user = await prisma.user.findFirst()
    console.log('Database connection successful. Found user:', user?.username)
  } catch (err) {
    console.error('Database connection failed:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
