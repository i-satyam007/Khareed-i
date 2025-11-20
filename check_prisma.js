// check_prisma.js
try {
  const pkg = require("@prisma/client");
  console.log("keys:", Object.keys(pkg));
  console.log("PrismaClient:", typeof pkg.PrismaClient);
} catch (e) {
  console.error("require error:", e && e.message);
}
