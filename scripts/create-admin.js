const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin!group5', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'johnkumarsingh010@gmail.com' },
    update: {
      role: 'admin',
      password: hashedPassword,
      username: 'admin',
      name: 'Admin User'
    },
    create: {
      email: 'johnkumarsingh010@gmail.com',
      username: 'admin',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin'
    },
  });

  console.log('Admin user created/updated:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
