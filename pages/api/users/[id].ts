import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const userId = Number(id);

    if (req.method === 'GET') {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true,
                    hostel: true,
                    createdAt: true,
                    listings: {
                        where: { status: 'active' },
                        include: {
                            owner: { select: { name: true, hostel: true } },
                            bids: { orderBy: { amount: 'desc' }, take: 1 }
                        }
                    },
                    reviews: true,
                    orders: {
                        where: { status: 'COMPLETED' } // Assuming completed orders count as sales for now, though technically it's orders *made* by user. For sales count we need to check listings sold.
                    }
                }
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Calculate sales count (listings sold)
            const salesCount = await prisma.listing.count({
                where: {
                    ownerId: userId,
                    status: 'sold'
                }
            });

            // Calculate rating
            const rating = user.reviews.length > 0
                ? (user.reviews.reduce((acc, review) => acc + review.rating, 0) / user.reviews.length).toFixed(1)
                : null;

            return res.status(200).json({
                ...user,
                salesCount,
                rating,
                reviewCount: user.reviews.length
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to fetch user profile' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
