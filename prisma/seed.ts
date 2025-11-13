import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Inicializa el Prisma Client
const prisma = new PrismaClient();

async function main() {
  // Crea un usuario Administrador para la configuración inicial
  console.log('Creando usuario administrador inicial...');
  const hashedPassword = await bcrypt.hash('admin-password', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: hashedPassword,
      // Asegúrate de que tu schema.prisma tenga el enum Role con los valores ADMIN y USER
      role: 'ADMIN',
    },
  });

  console.log('Usuario administrador creado:');
  console.log(adminUser);
}

// Ejecuta la función main y maneja los errores
main()
  .then(async () => {
    console.log('Seed completado exitosamente.');
    await prisma.$disconnect();
  })
  .catch(async (e: unknown) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
