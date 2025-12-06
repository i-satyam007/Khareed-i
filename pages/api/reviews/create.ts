import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUser } from '../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { listing: true } } }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify user is the buyer
        if (order.userId !== user.id) {
            return res.status(403).json({ message: 'Only the buyer can review this order' });
        }

        // Verify order is delivered
        if ((order as any).deliveryStatus !== 'DELIVERED') {
            return res.status(400).json({ message: 'Order must be delivered before reviewing' });
        }

        if (!order.items.length || !order.items[0].listingId) {
            return res.status(400).json({ message: 'Cannot review this item (no associated listing found)' });
        }

        const listingId = order.items[0].listingId;

        // Check if already reviewed
        const existingReview = await prisma.review.findFirst({
            where: {
                userId: user.id,
                listingId: listingId
            }
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this item' });
        }

        // Create Review
        const review = await prisma.review.create({
            data: {
                userId: user.id,
                listingId: listingId,
                rating: Number(rating),
                comment: comment || ''
            }
        });

        // Notify Seller
        if (order.items[0].listing) {
            const sellerId = order.items[0].listing.ownerId;
            await prisma.notification.create({
                data: {
                    userId: sellerId,
                    title: 'New Review Received',
                    body: `${user.name} gave you a ${rating}-star review for "${order.items[0].listing.title}".`,
                    type: 'success',
                    link: `/users/${sellerId}` // Link to profile where reviews are shown
                }
            });
        }

        return res.status(201).json(review);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
