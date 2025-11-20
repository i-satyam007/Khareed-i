const { PrismaClient } = require('@prisma/client');

(async () => {
  try {
    const p = new PrismaClient();
    await p.$connect();
    console.log('connected ok');
    await p.$disconnect();
  } catch (e) {
    console.error('connect error:', e.message);
    process.exit(1);
  }
})();
