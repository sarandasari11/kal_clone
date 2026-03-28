const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const user = await prisma.user.findFirst({
      where: { username: 'admin' }
    })
    console.log('User admin:', user ? 'Found' : 'Not Found')
    
    if (user) {
      const et = await prisma.eventType.findFirst({
        where: { userId: user.id, slug: 'discovery' }
      })
      console.log('Event discovery:', et ? 'Found' : 'Not Found')
    }
  } catch (err) {
    console.error(err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
