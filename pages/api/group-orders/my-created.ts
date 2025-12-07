import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUser } from '../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const groupOrders = await prisma.groupOrder.findMany({
            where: { creatorId: user.id },
            include: {
                _count: {
                    select: { participants: true, orders: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json(groupOrders);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
