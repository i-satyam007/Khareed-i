import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUser } from '../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Missing receiverId or content' });
        }

        try {
            const message = await prisma.message.create({
                data: {
                    senderId: user.id,
                    receiverId: Number(receiverId),
                    content,
                },
                include: {
                    sender: { select: { id: true, name: true, avatar: true } },
                    receiver: { select: { id: true, name: true, avatar: true } }
                }
            });
            return res.status(201).json(message);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to send message' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
