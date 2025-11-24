import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUser } from '../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getUser(req);

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const notifications = await prisma.notification.findMany({
                where: {
                    userId: user.id,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 20, // Limit to recent 20
            });
            return res.status(200).json(notifications);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to fetch notifications' });
        }
    } else if (req.method === 'PUT') {
        // Mark all as read or specific one
        try {
            const { id } = req.body;

            if (id) {
                await prisma.notification.update({
                    where: { id: Number(id) },
                    data: { read: true },
                });
            } else {
                await prisma.notification.updateMany({
                    where: { userId: user.id, read: false },
                    data: { read: true },
                });
            }

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to update notifications' });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
