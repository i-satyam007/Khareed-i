import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getUser } from '../../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const orderId = Number(req.query.id);

    if (req.method === 'POST') {
        const { action, reason } = req.body; // action: 'APPROVE' | 'REJECT'

        if (!['APPROVE', 'REJECT'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    items: { include: { listing: true } },
                    groupOrder: true,
                    user: true, // The buyer
                },
            });

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Verify ownership (Lister or Group Order Creator)
            let isOwner = false;
            if (order.groupOrder) {
                isOwner = order.groupOrder.creatorId === user.id;
            } else if (order.items.length > 0) {
                isOwner = order.items[0].listing.ownerId === user.id;
            }

            if (!isOwner) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            if (action === 'APPROVE') {
                const updatedOrder = await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'COMPLETED',
                    },
                });

                // Mark listing as sold
                if (order.items.length > 0) {
                    await prisma.listing.update({
                        where: { id: order.items[0].listingId },
                        data: { status: 'sold' },
                    });
                }

                // Notify Seller
                await prisma.notification.create({
                    data: {
                        userId: user.id, // Seller is the one verifying
                        title: 'Item Sold!',
                        body: `Payment verified! Your item has been officially sold.`,
                        type: 'success',
                        link: `/orders/${orderId}`,
                    },
                });

                // Notify Buyer
                await prisma.notification.create({
                    data: {
                        userId: order.userId,
                        title: 'Payment Verified',
                        body: `Your payment has been verified. The order is now complete!`,
                        type: 'success',
                        link: `/orders/${orderId}`,
                    },
                });

                return res.status(200).json(updatedOrder);
            } else {
                // REJECT Logic
                if (!reason) {
                    return res.status(400).json({ message: 'Rejection reason is required' });
                }

                const buyerId = order.userId;

                // Update Order
                const updatedOrder = await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'REJECTED',
                        paymentComment: `Rejection Reason: ${reason}`,
                    },
                });

                // Increment failed count
                const buyer = await prisma.user.update({
                    where: { id: buyerId },
                    data: {
                        failedPaymentCount: { increment: 1 },
                    },
                });

                // Blacklist Logic
                if (buyer.failedPaymentCount >= 5) {
                    const penaltyLevel = buyer.failedPaymentCount - 4; // 1st penalty at 5
                    const hours = 24 * Math.pow(2, penaltyLevel - 1); // 24, 48, 96...

                    const blacklistUntil = new Date();
                    blacklistUntil.setHours(blacklistUntil.getHours() + hours);

                    await prisma.user.update({
                        where: { id: buyerId },
                        data: { blacklistUntil },
                    });
                }

                return res.status(200).json(updatedOrder);
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to verify payment' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
