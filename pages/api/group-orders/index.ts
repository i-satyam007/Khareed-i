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
            const groupOrders = await prisma.groupOrder.findMany({
                where: {
                    status: 'open',
                    cutoff: { gt: new Date() },
                },
                include: {
                    creator: {
                        select: {
                            name: true,
                            hostel: true,
                            avatar: true,
                        },
                    },
                    participants: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return res.status(200).json(groupOrders);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to fetch group orders' });
        }
    }

    if (req.method === 'POST') {
        const { title, platform, cutoffTime, description, minOrderValue, deliveryFee } = req.body;

        if (!title || !platform || !cutoffTime) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Parse cutoff time (assuming HH:mm format for today)
        const [hours, minutes] = cutoffTime.split(':').map(Number);
        const cutoffDate = new Date();
        cutoffDate.setHours(hours, minutes, 0, 0);

        // If cutoff is in the past, assume it's for tomorrow (or handle as error)
        if (cutoffDate < new Date()) {
            cutoffDate.setDate(cutoffDate.getDate() + 1);
        }

        // Update user's QR code if provided
        if (req.body.qrCode) {
            await prisma.user.update({
                where: { id: user.id },
                data: { qrCode: req.body.qrCode },
            });
        }

        try {
            const groupOrder = await prisma.groupOrder.create({
                data: {
                    title,
                    platform,
                    description,
                    cutoff: cutoffDate,
                    creatorId: user.id,
                    status: 'open',
                    deliveryFee: Number(deliveryFee) || 0,
                    paymentMethods: req.body.paymentMethods || ["CASH"],
                },
            });
            return res.status(201).json(groupOrder);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to create group order' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
