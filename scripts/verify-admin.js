const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load .env manually
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
} catch (e) {
  console.error('Error loading .env:', e);
}

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'johnkumarsingh010@gmail.com' },
        { username: 'admin' }
      ]
    }
  });

  if (admin) {
    console.log('Admin user found:', {
      id: admin.id,
      email: admin.email,
      username: admin.username,
      role: admin.role,
      passwordHash: admin.password.substring(0, 10) + '...'
    });
  } else {
    console.log('Admin user NOT found.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
