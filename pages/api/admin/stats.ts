import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withIronSessionApiRoute } from 'iron-session/next';
import { sessionOptions } from '@/lib/session';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = req.session.user;

    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const totalUsers = await prisma.user.count();
        const activeListings = await prisma.listing.count({ where: { status: 'active' } });
        const pendingListings = await prisma.listing.count({ where: { status: 'pending' } }); // Assuming 'pending' status exists or we use something else

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

export default withIronSessionApiRoute(handler, sessionOptions);
