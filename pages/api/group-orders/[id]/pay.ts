import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getUser } from '../../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    const groupOrderId = Number(id);

    if (req.method === 'POST') {
        try {
            const groupOrder = await prisma.groupOrder.findUnique({
                where: { id: groupOrderId },
                include: {
                    participants: {
                        where: { userId: user.id },
                    },
                },
            });

            if (!groupOrder) {
                return res.status(404).json({ message: 'Group order not found' });
            }

            const userItems = groupOrder.participants;
            if (userItems.length === 0) {
                return res.status(400).json({ message: 'No items to pay for' });
            }

            const { paymentMethod } = req.body;

            const totalAmount = userItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0);

            // Create an Order linked to this Group Order
            const order = await prisma.order.create({
                data: {
                    userId: user.id,
                    totalAmount: totalAmount,
                    status: 'pending', // Simulating Escrow
                    groupOrderId: groupOrderId,
                    paymentMethod: paymentMethod || 'CASH',
                },
            });

            // Notify Group Order Creator
            await prisma.notification.create({
                data: {
                    userId: groupOrder.creatorId,
                    title: 'New Group Order Contribution',
                    body: `${user.name || user.username} has joined your group order "${groupOrder.title}". Waiting for payment.`,
                    type: 'alert',
                    link: `/orders/${order.id}`,
                },
            });

            return res.status(201).json(order);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to process payment' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};
