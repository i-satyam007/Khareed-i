
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.report.count();
        console.log(`Total Reports Now: ${count}`);

        // @ts-ignore - Prisma types update lag
        const firstReport = await prisma.report.findFirst({ include: { listing: true, reporter: true } });
        if (firstReport) {
            console.log("Sample Report:", JSON.stringify(firstReport, null, 2));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
