import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUser } from '../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const offerId = parseInt(id as string);

    if (isNaN(offerId)) {
        return res.status(400).json({ message: 'Invalid offer ID' });
    }

    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'PUT') {
        const { status } = req.body; // ACCEPTED or REJECTED

        if (!['ACCEPTED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        try {
            const offer = await prisma.offer.findUnique({
                where: { id: offerId },
                include: { listing: true },
            });

            if (!offer) {
                return res.status(404).json({ message: 'Offer not found' });
            }

            // Only listing owner can accept/reject
            if (offer.listing.ownerId !== user.id) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            const updatedOffer = await prisma.$transaction(async (tx) => {
                const updated = await tx.offer.update({
                    where: { id: offerId },
                    data: { status },
                });

                // If accepted, reject all other pending offers for this listing
                if (status === 'ACCEPTED') {
                    const otherOffers = await tx.offer.findMany({
                        where: {
                            listingId: offer.listingId,
                            id: { not: offerId },
                            status: 'PENDING',
                        },
                    });

                    if (otherOffers.length > 0) {
                        await tx.offer.updateMany({
                            where: {
                                listingId: offer.listingId,
                                id: { not: offerId },
                                status: 'PENDING',
                            },
                            data: { status: 'REJECTED' },
                        });

                        // Notify rejected bidders
                        await tx.notification.createMany({
                            data: otherOffers.map((o) => ({
                                userId: o.userId,
                                title: 'Offer Rejected',
                                body: `Your offer for "${offer.listing.title}" was rejected because another offer was accepted.`,
                                type: 'general',
                                link: `/listings/${offer.listingId}`,
                            })),
                        });
                    }
                }

                return updated;
            });

            // Notify bidder
            await prisma.notification.create({
                data: {
                    userId: offer.userId,
                    title: `Offer ${status === 'ACCEPTED' ? 'Accepted' : 'Rejected'}`,
                    body: `Your offer of ₹${offer.amount} for "${offer.listing.title}" was ${status.toLowerCase()}. ${status === 'ACCEPTED' ? 'Please confirm your order.' : ''}`,
                    type: status === 'ACCEPTED' ? 'alert' : 'general',
                    link: `/listings/${offer.listingId}`,
                },
            });

            return res.status(200).json(updatedOffer);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
