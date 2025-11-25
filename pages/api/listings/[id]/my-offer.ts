import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getUser } from '../../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const listingId = parseInt(id as string);

    if (isNaN(listingId)) {
        return res.status(400).json({ message: 'Invalid listing ID' });
    }

    const user = await getUser(req);

    if (!user) return res.status(200).json(null);

    try {
        const offer = await prisma.offer.findFirst({
            where: {
                listingId,
                userId: user.id,
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json(offer);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
