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

    const { senderId } = req.body;

    if (!senderId) {
        return res.status(400).json({ message: 'Missing sender ID' });
    }

    try {
        await prisma.message.updateMany({
            where: {
                senderId: Number(senderId),
                receiverId: user.id,
                read: false,
            },
            data: {
                read: true,
            },
        });

        return res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
