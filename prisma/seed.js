const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Create Users
  const satyam = await prisma.user.upsert({
    where: { email: 'satyam@ipm.edu' },
    update: {},
    create: {
      name: 'Satyam Kumar',
      email: 'satyam@ipm.edu',
      username: 'satyam_k',
      password: 'password123',
      role: 'admin',
      hostel: 'BH-3',
      phone: '+91 98765 43210',
    },
  });

  const aman = await prisma.user.upsert({
    where: { email: 'aman@ipm.edu' },
    update: {},
    create: {
      name: 'Aman Gupta',
      email: 'aman@ipm.edu',
      username: 'aman_g',
      password: 'password123',
      hostel: 'BH-3',
    },
  });

  const khushi = await prisma.user.upsert({
    where: { email: 'khushi@ipm.edu' },
    update: {},
    create: {
      name: 'Khushi Singh',
      email: 'khushi@ipm.edu',
      username: 'khushi_s',
      password: 'password123',
      hostel: 'GH-2',
    },
  });

  console.log('Created Users:', { satyam, aman, khushi });

  // 2. Create Listings
  const listings = [
    {
      title: "Scientific Calculator FX-991ES (Barely used)",
      description: "Used for 1 semester only. Perfect condition.",
      category: "Electronics",
      mrp: 950,
      price: 650,
      negotiable: true,
      ownerId: satyam.id,
      imagePath: null,
    },
    {
      title: "Wireless Mouse Logitech",
      description: "Brand new sealed pack.",
      category: "Electronics",
      mrp: 999,
      price: 550,
      isAuction: true,
      auctionFrom: 300,
      auctionTo: new Date(Date.now() + 24 * 60 * 60 * 1000),
      ownerId: aman.id,
    },
    {
      title: "IPM Quant Book Bundle (IMS + TIME)",
      description: "Full set of books for IPMAT preparation.",
      category: "Books",
      mrp: 2200,
      price: 1200,
      negotiable: false,
      ownerId: khushi.id,
    },
    {
      title: "Table Lamp with Study Light",
      description: "Adjustable brightness, USB powered.",
      category: "Hostel Essentials",
      mrp: 800,
      price: 400,
      negotiable: true,
      ownerId: satyam.id,
    },
    {
      title: "Basic Dumbbell Set (2 x 5kg)",
      description: "Rubber coated dumbbells.",
      category: "Sports Gear",
      mrp: 1500,
      price: 900,
      negotiable: true,
      ownerId: aman.id,
    },
  ];

  for (const l of listings) {
    await prisma.listing.create({ data: l });
  }
  console.log('Created Listings');

  // 3. Create Group Orders
  const groupOrders = [
    {
      platform: "Blinkit",
      title: "Midnight snacks run",
      description: "Ordering chips and coke.",
      cutoff: new Date(Date.now() + 2 * 60 * 60 * 1000),
      creatorId: aman.id,
      status: "open",
    },
    {
      platform: "BigBasket",
      title: "Weekly groceries",
      description: "Fruits and milk.",
      cutoff: new Date(Date.now() + 24 * 60 * 60 * 1000),
      creatorId: khushi.id,
      status: "open",
    },
    {
      platform: "Swiggy",
      title: "Biryani from Behrouz",
      description: "Dinner plan.",
      cutoff: new Date(Date.now() + 4 * 60 * 60 * 1000),
      creatorId: satyam.id,
      status: "open",
    },
  ];

  for (const go of groupOrders) {
    await prisma.groupOrder.create({ data: go });
  }
  console.log('Created Group Orders');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
