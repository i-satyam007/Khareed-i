import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUser } from '../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        // Fetch recent conversations
        // This is a bit complex in Prisma without raw SQL for grouping, so we'll fetch all messages and process in JS for MVP
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
                        otherUser,
                        lastMessage: msg
                    });
                }
            });

            return res.status(200).json(Array.from(conversations.values()));
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to fetch conversations' });
        }
    } else if (req.method === 'POST') {
        // Send a message
        const { receiverId, content } = req.body;
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
