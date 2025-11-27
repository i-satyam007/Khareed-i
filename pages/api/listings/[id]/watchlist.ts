import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getUser } from '../../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    const listingId = Number(id);

    if (req.method === 'POST') {
        try {
            // Check if already in watchlist
            const existing = await prisma.user.findFirst({
                where: {
                    id: user.id,
                    watchlist: {
                        some: { id: listingId }
                    }
                }
            });

            if (existing) {
                // Remove from watchlist
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        watchlist: {
                            disconnect: { id: listingId }
                        }
                    }
                });
                return res.status(200).json({ inWatchlist: false });
            } else {
                // Add to watchlist
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        watchlist: {
                            connect: { id: listingId }
                        }
                    }
                });
                return res.status(200).json({ inWatchlist: true });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to update watchlist' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
