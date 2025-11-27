import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUser } from '../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { userId } = req.query;
    const otherUserId = Number(userId);

    if (req.method === 'GET') {
        try {
            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { senderId: user.id, receiverId: otherUserId },
                        { senderId: otherUserId, receiverId: user.id }
                    ]
                },
                orderBy: { createdAt: 'asc' },
                include: {
                    sender: { select: { id: true, name: true, avatar: true } },
                    receiver: { select: { id: true, name: true, avatar: true } }
                }
            });

            return res.status(200).json(messages);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to fetch messages' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
