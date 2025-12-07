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
    const { status } = req.body; // 'PLACED', 'RECEIVED', 'DELIVERED'

    if (!['PLACED', 'RECEIVED', 'DELIVERED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const groupOrder = await prisma.groupOrder.findUnique({
            where: { id: Number(id) },
        });

        if (!groupOrder) {
            return res.status(404).json({ message: 'Group order not found' });
        }

        if (groupOrder.creatorId !== user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Map status to Order Delivery Status
        const deliveryStatusMap: any = {
            'PLACED': 'ORDER_PLACED',
            'RECEIVED': 'RECEIVED_FROM_PARTNER',
            'DELIVERED': 'DELIVERED'
        };

        const notificationBodyMap: any = {
            'PLACED': `The seller has placed the order for "${groupOrder.title}".`,
            'RECEIVED': `The seller has received the order "${groupOrder.title}" from the delivery partner.`,
            'DELIVERED': `The order "${groupOrder.title}" has been delivered to you!`
        };

        const newStatus = deliveryStatusMap[status];

        // Update all related orders
        await prisma.order.updateMany({
            where: { groupOrderId: Number(id) },
            data: { deliveryStatus: newStatus }
        });

        // Fetch all orders to get user IDs for notifications
        const orders = await prisma.order.findMany({
            where: { groupOrderId: Number(id) },
            select: { userId: true }
        });

        // Send Notifications
        const notifications = orders.map(o => ({
            userId: o.userId,
            title: `Update on Group Order: ${groupOrder.title}`,
            body: notificationBodyMap[status],
            type: 'info',
            link: `/orders`
        }));

        await prisma.notification.createMany({
            data: notifications
        });

        return res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
