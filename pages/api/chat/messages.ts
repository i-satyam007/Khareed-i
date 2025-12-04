import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUser } from '../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { userId } = req.query;

    if (req.method === 'GET') {
        if (!userId) {
            return res.status(400).json({ message: 'Missing userId' });
        }

        try {
            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { senderId: user.id, receiverId: Number(userId) },
                        { senderId: Number(userId), receiverId: user.id }
                    ]
                },
                orderBy: { createdAt: 'asc' }, // Oldest first for chat history
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
