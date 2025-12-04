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
            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { senderId: user.id },
                        { receiverId: user.id }
                    ]
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    sender: { select: { id: true, name: true, avatar: true } },
                    receiver: { select: { id: true, name: true, avatar: true } }
                }
            });

            const conversations = new Map();
            messages.forEach((msg: any) => {
                const otherUser = msg.senderId === user.id ? msg.receiver : msg.sender;
                if (!conversations.has(otherUser.id)) {
                    conversations.set(otherUser.id, {
                        id: msg.id, // Use message ID as conversation ID for key
                        senderId: msg.senderId,
                        receiverId: msg.receiverId,
                        content: msg.content,
                        createdAt: msg.createdAt,
                        sender: msg.sender,
                        receiver: msg.receiver
                    });
                }
            });

            return res.status(200).json(Array.from(conversations.values()));
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to fetch conversations' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
