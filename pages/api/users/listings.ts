import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUser } from '../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getUser(req);

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const listings = await prisma.listing.findMany({
                where: {
                    ownerId: user.id,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    bids: {
                        orderBy: { amount: 'desc' },
                        take: 1,
                    },
                    _count: {
                        select: { bids: true }
                    }
                },
            });

            res.status(200).json(listings);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
