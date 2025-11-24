import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUser } from '../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getUser(req);

    if (req.method === 'GET') {
        const { search, category } = req.query;

        try {
            const where: any = {
                status: 'active',
            };

            if (search) {
                where.OR = [
                    { title: { contains: search as string, mode: 'insensitive' } },
                    { description: { contains: search as string, mode: 'insensitive' } },
                ];
            }

            if (category) {
                where.category = category as string;
            }

            const listings = await prisma.listing.findMany({
                where,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    owner: {
                        select: { name: true },
                    },
                    bids: {
                        orderBy: { amount: 'desc' },
                        take: 1,
                        include: {
                            bidder: {
                                select: { name: true, username: true },
                            },
                        },
                    },
                },
            });

            res.status(200).json(listings);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else if (req.method === 'POST') {
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { title, description, category, mrp, price, negotiable, isAuction, auctionStartPrice, auctionDuration, allowNegativeBids } = req.body;

        let auctionTo = null;
        if (isAuction && auctionDuration) {
            const durationHours = Number(auctionDuration);
            auctionTo = new Date();
            auctionTo.setHours(auctionTo.getHours() + durationHours);
        }

        try {
            const listing = await prisma.listing.create({
                data: {
                    title,
                    description,
                    category,
                    mrp: Math.round(Number(mrp)),
                    price: isAuction ? Math.round(Number(auctionStartPrice)) : Math.round(Number(price)),
                    negotiable: Boolean(negotiable),
                    isAuction: Boolean(isAuction),
                    auctionFrom: isAuction ? Math.round(Number(auctionStartPrice)) : null,
                    auctionTo: auctionTo,
                    allowNegBid: Boolean(allowNegativeBids),
                    ownerId: user.id,
                    imagePath: req.body.imagePath || null,
                    expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
                },
            });
            return res.status(201).json(listing);
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({ message: error.message || 'Failed to create listing' });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
