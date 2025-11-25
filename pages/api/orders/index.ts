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
            const orders = await prisma.order.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                include: {
                    items: {
                        include: {
                            listing: {
                                select: { title: true, imagePath: true, owner: { select: { name: true } } }
                            }
                        }
                    }
                }
            });
            return res.status(200).json(orders);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
