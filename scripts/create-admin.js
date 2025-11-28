const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load .env manually
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const firstEquals = line.indexOf('=');
      if (firstEquals !== -1) {
        const key = line.substring(0, firstEquals).trim();
        let value = line.substring(firstEquals + 1).trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error('Error loading .env:', e);
}

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
