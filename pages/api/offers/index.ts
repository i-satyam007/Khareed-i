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

    const { listingId, amount } = req.body;

    if (!listingId || !amount) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.ownerId === user.id) {
            return res.status(400).json({ message: 'Cannot offer on your own listing' });
        }

        const offer = await prisma.offer.create({
            data: {
                listingId,
                userId: user.id,
                amount: Number(amount),
            },
        });

        // Notify owner
        await prisma.notification.create({
            data: {
                userId: listing.ownerId,
                title: 'New Offer Received',
                body: `You received an offer of ₹${amount} for "${listing.title}"`,
                type: 'general',
            },
        });

        return res.status(201).json(offer);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
