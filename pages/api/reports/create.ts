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

    const { orderId, reason } = req.body;

    if (!orderId || !reason) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    try {
        const order = await prisma.order.findUnique({
            where: { id: Number(orderId) },
            include: { items: { include: { listing: true } }, groupOrder: true }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Determine reported user (Seller)
        let reportedId = order.items[0]?.listing?.ownerId || order.groupOrder?.creatorId;

        if (!reportedId) {
            return res.status(400).json({ message: 'Could not determine seller' });
        }

        const report = await prisma.report.create({
            data: {
                reporterId: user.id,
                reportedId: reportedId,
                orderId: Number(orderId),
                reason,
                status: 'PENDING'
            }
        });

        // Notify Admin (Optional: could be an email or just dashboard visibility)
        // For now, it will just show up in the Admin Dashboard

        return res.status(200).json(report);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
