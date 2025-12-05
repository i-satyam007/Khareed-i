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
                    failedPaymentCount: true,
                    listings: {
                        where: { status: 'active' },
                        include: {
                            owner: { select: { name: true, hostel: true } },
                            bids: { orderBy: { amount: 'desc' }, take: 1 }
                        }
                    },
                    reviews: {
                        orderBy: { createdAt: 'desc' },
                        include: {
                            user: { select: { name: true, avatar: true } }
                        }
                    },
                    orders: {
                        where: { status: 'completed' }
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
            const averageRating = user.reviews.length > 0
                ? (user.reviews.reduce((acc, review) => acc + review.rating, 0) / user.reviews.length)
                : 0;

            // Calculate Trust Score
            // Base: 100
            // Penalty: -10 per failed payment
            // Bonus: +2 per star in average rating (max +10)
            // Cap: 100
            let trustScore = 100 - (user.failedPaymentCount * 10) + (averageRating * 2);
            if (trustScore > 100) trustScore = 100;
            if (trustScore < 0) trustScore = 0;

            return res.status(200).json({
                ...user,
                salesCount,
                rating: averageRating.toFixed(1),
                reviewCount: user.reviews.length,
                trustScore: Math.round(trustScore),
                reviews: user.reviews.map(r => ({
                    id: r.id,
                    rating: r.rating,
                    comment: r.comment,
                    createdAt: r.createdAt,
                    reviewerName: r.user.name,
                    reviewerAvatar: r.user.avatar
                }))
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to fetch user profile' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
