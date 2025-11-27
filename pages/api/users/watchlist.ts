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
            const userData = await prisma.user.findUnique({
                where: { id: user.id },
                include: {
                    watchlist: {
                        include: {
                            owner: true,
                            bids: true
                        }
                    }
                }
            });

            if (!userData) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json(userData.watchlist);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to fetch watchlist' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
