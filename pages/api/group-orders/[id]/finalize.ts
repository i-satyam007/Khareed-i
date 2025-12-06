import type { NextApiRequest, NextApiResponse } from 'next';
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
    const groupOrderId = Number(id);

    try {
        const groupOrder = await prisma.groupOrder.findUnique({
            where: { id: groupOrderId },
            include: {
                participants: {
                    include: { user: true }
                }
            }
        });

        if (!groupOrder) {
            return res.status(404).json({ message: 'Group Order not found' });
        }

        if (groupOrder.creatorId !== user.id) {
            return res.status(403).json({ message: 'Only the creator can finalize this order' });
        }

        if (groupOrder.status !== 'open') {
            return res.status(400).json({ message: 'Order is not open' });
        }

        // 1. Calculate Totals
        // Use 'amount' from GroupOrderItem
        const totalItemsValue = groupOrder.participants.reduce((sum, item) => sum + item.amount, 0);
        const deliveryFee = groupOrder.deliveryFee || 0;
        const handlingFee = 10;
        const totalFees = deliveryFee + handlingFee;

        // 2. Group items by User
        // participants is actually GroupOrderItem[]
        const userItemsMap = new Map<number, typeof groupOrder.participants>();

        for (const item of groupOrder.participants) {
            const items = userItemsMap.get(item.userId) || [];
            items.push(item);
            userItemsMap.set(item.userId, items);
        }

        // 3. Create Order for each User
        await prisma.$transaction(async (tx) => {
            // Update Group Order Status
            await tx.groupOrder.update({
                where: { id: groupOrderId },
                data: { status: 'payment_pending' }
            });

            for (const [userId, items] of userItemsMap.entries()) {
                const userItemTotal = items.reduce((sum, i) => sum + i.amount, 0);

                // Weighted split logic
                const userShareOfFees = totalItemsValue > 0
                    ? (userItemTotal / totalItemsValue) * totalFees
                    : 0;

                const totalAmount = Math.round(userItemTotal + userShareOfFees);

                if (totalAmount <= 0) continue;

                // Create Order
                const order = await tx.order.create({
                    data: {
                        userId,
                        totalAmount,
                        status: 'PENDING_PAYMENT',
                        deliveryStatus: 'PENDING',
                        groupOrderId: groupOrderId,
                        items: {
                            create: items.map(item => ({
                                itemName: item.itemName || 'Group Order Item', // Fallback
                                price: item.amount,
                                quantity: 1, // Usually 1 for these ad-hoc items
                                // listingId is null. Ensure ItemName is provided in schema update
                            }))
                        }
                    }
                });

                // Send Notification
                await tx.notification.create({
                    data: {
                        userId,
                        title: "Payment Requested",
                        body: `Please pay ₹${totalAmount} for your share of "${groupOrder.title}".`,
                        type: 'alert',
                        link: `/orders/${order.id}/pay`
                    }
                });
            }
        });

        return res.status(200).json({ message: 'Group order finalized and payment requests sent.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
