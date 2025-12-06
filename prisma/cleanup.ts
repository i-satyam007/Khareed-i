const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export { }; // Make this a module


async function main() {
    console.log('Starting cleanup...');

    // 1. Find Admin
    // Using email 'satyam@ipm.edu' as per seed.ts, or role 'admin'
    const admin = await prisma.user.findFirst({
        where: { role: 'admin' }
    });

    if (!admin) {
        console.log("No admin found. Aborting cleanup to prevent total data loss.");
        return;
    }

    console.log(`Found Admin: ${admin.name} (${admin.email}). Preserving this account.`);
    const adminId = admin.id;

    // 2. Delete Dependent Data (Child Tables)

    // Notifications
    // We can delete all notifications? Or keep admin's?
    // "delete all data... EXCEPT Admin's account" implies admin's data might be preserved?
    // "delete all data from the database (all listings, images, qr codes, etc.) EXCEPT Admin's account and profile pic"
    // It sounds like "reset the app", but keep the admin login.
    // I will delete ALL listings/orders etc., even if created by admin (though admin usually manages).
    // But usually "except Admin's account" means keep the User record.
    // If admin has listings, should they be deleted? "all listings". Yes.

    console.log("Deleting child records...");

    await prisma.notification.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.report.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.bid.deleteMany({});
    await prisma.offer.deleteMany({});

    // OrderItems and GroupOrderItems must be deleted before Orders/GroupOrders
    await prisma.orderItem.deleteMany({});
    await prisma.groupOrderItem.deleteMany({});

    // Orders
    await prisma.order.deleteMany({});

    // Listings (Admin's listings too? Yes, "all listings")
    await prisma.listing.deleteMany({});

    // GroupOrders
    await prisma.groupOrder.deleteMany({});

    // VerificationCodes (these are temp)
    await prisma.verificationCode.deleteMany({});

    // 3. Delete Users (Except Admin)
    console.log("Deleting non-admin users...");
    await prisma.user.deleteMany({
        where: {
            id: {
                not: adminId
            }
        }
    });

    // 4. Reset Admin Fields?
    // "EXCEPT Admin's account and profile pic"
    // User might want to keep the admin user as is.
    // I won't update the admin record (to remove listings relation etc. - handling by deleteMany is automatic if cascade, or just fine as we deleted listings).

    // Note: If schemas have Cascade delete, great. If not, the order above handles it.

    console.log("Cleanup finished. Admin account preserved.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
