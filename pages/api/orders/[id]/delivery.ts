import type { NextApiRequest, NextApiResponse } from 'next';
// Force TS re-check
import { prisma } from '../../../../lib/prisma';
import { getUser } from '../../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    const { action } = req.body; // 'DELIVERED' (by seller) or 'RECEIVED' (by buyer)

    if (!id || !action) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    try {
        const order = await prisma.order.findUnique({
            where: { id: Number(id) },
            include: { items: { include: { listing: true } }, groupOrder: true }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Determine Seller ID
        const sellerId = order.items[0]?.listing?.ownerId || order.groupOrder?.creatorId;

        if (action === 'DELIVERED') {
            // Only Seller can mark as Delivered (Shipped)
            if (user.id !== sellerId) {
                return res.status(403).json({ message: 'Only seller can mark as delivered' });
            }

            await prisma.order.update({
                where: { id: Number(id) },
                data: { deliveryStatus: 'SHIPPED' } as any
            });

            // Notify Buyer
            await prisma.notification.create({
                data: {
                    userId: order.userId,
                    title: 'Order Delivered by Seller',
                    body: `${user.name} has delivered your order #${order.id}. Please confirm receipt in My Orders.`,
                    type: 'success',
                    link: '/dashboard/my-orders'
                }
            });

        } else if (action === 'RECEIVED') {
            // Only Buyer can mark as Received
            if (user.id !== order.userId) {
                return res.status(403).json({ message: 'Only buyer can mark as received' });
            }

            if ((order as any).deliveryStatus !== 'SHIPPED') {
                return res.status(400).json({ message: 'Seller has not marked as delivered yet' });
            }

            await prisma.order.update({
                where: { id: Number(id) },
                data: { deliveryStatus: 'DELIVERED' } as any
            });

            // Trust Score Logic: Reward Seller for successful delivery
            // We reduce penalty (improve score) by 5 points, capped at 0 (can't have negative penalty to boost > 100)
            // Or if we want to allow bonus, we'd need a different field. Given schema, reducing penalty is best effort.
            if (sellerId) {
                // @ts-ignore
                const seller = await prisma.user.findUnique({ where: { id: sellerId }, select: { trustScorePenalty: true } });
                // @ts-ignore
                if (seller && seller.trustScorePenalty > 0) {
                    // @ts-ignore
                    const newPenalty = Math.max(0, seller.trustScorePenalty - 5);
                    // @ts-ignore
                    await prisma.user.update({
                        where: { id: sellerId },
                        data: { trustScorePenalty: newPenalty }
                    });
                }
            }

            // Notify Seller
            await prisma.notification.create({
                data: {
                    userId: sellerId!,
                    title: 'Delivery Confirmed',
                    body: `Buyer confirmed receipt of Order #${order.id}. Transaction Complete.`,
                    type: 'success',
                    link: `/orders/${order.id}`
                }
            });
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        return res.status(200).json({ message: 'Status updated' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
