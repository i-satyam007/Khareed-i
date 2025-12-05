import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUser } from '../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const listings = await prisma.listing.findMany({
            where: {
                ownerId: user.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                _count: {
                    select: {
                        bids: true,
                        favoritedBy: true
                    }
                }
            }
        });

        // Transform data to match UI needs
        const formattedListings = listings.map(listing => ({
            id: listing.id,
            title: listing.title,
            price: listing.price,
            status: listing.status === 'active' ? 'Active' : listing.status === 'sold' ? 'Sold' : 'Inactive',
            views: 0, // We don't track views yet
            posted: new Date(listing.createdAt).toLocaleDateString(),
            image: listing.imagePath,
            bidsCount: listing._count.bids,
            likesCount: listing._count.favoritedBy
        }));

        return res.status(200).json(formattedListings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
