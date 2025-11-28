import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getUser } from '@/lib/getUser';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getUser(req);

    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const totalUsers = await prisma.user.count();
        const activeListings = await prisma.listing.count({ where: { status: 'active' } });
        const pendingListings = await prisma.listing.count({ where: { status: 'pending' } });

        res.json({
            totalUsers,
            activeListings,
            pendingListings
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    } finally {
        await prisma.$disconnect();
    }
}
