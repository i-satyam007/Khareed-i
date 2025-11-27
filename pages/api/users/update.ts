import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUser } from '../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { hostel, phone, avatar } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                hostel,
                phone,
                avatar,
            },
        });

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update profile' });
    }
}
