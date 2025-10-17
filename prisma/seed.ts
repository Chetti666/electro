import { PrismaClient } from '@prisma/client';

// Inicializa el Prisma Client
const prisma = new PrismaClient();

async function main() {
  // Crea dos usuarios de ejemplo
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@prisma.io' },
    update: {},
    create: {
      email: 'alice@prisma.io',
      name: 'Alice',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@prisma.io' },
    update: {},
    create: {
      email: 'bob@prisma.io',
      name: 'Bob',
    },
  });

  console.log({ user1, user2 });
}

// Ejecuta la función main y maneja los errores
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: unknown) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
