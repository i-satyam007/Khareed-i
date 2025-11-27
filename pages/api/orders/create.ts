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

    const { listingId, offerId, paymentMethod } = req.body;

    if (!listingId) {
        return res.status(400).json({ message: 'Missing listing ID' });
    }

    if (!paymentMethod) {
        return res.status(400).json({ message: 'Missing payment method' });
    }

    try {
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.status !== 'active') {
            return res.status(400).json({ message: 'Listing is not active' });
        }

        // Validate payment method
        const availableMethods = (listing as any).paymentMethods || ["CASH"];
        if (availableMethods && !availableMethods.includes(paymentMethod)) {
            return res.status(400).json({ message: 'Invalid payment method for this listing' });
        }

        let price = listing.price;

        if (offerId) {
            const offer = await prisma.offer.findUnique({
                where: { id: offerId },
            });

            if (!offer || offer.listingId !== listingId || offer.userId !== user.id || offer.status !== 'ACCEPTED') {
                return res.status(400).json({ message: 'Invalid or unaccepted offer' });
            }
            price = offer.amount;
        } else if (listing.isAuction) {
            // Verify auction ended
            if (listing.auctionTo && new Date(listing.auctionTo) > new Date()) {
                return res.status(400).json({ message: 'Auction has not ended yet' });
            }

            // Fetch highest bid
            const highestBid = await prisma.bid.findFirst({
                where: { listingId },
                orderBy: { amount: 'desc' },
            });

            if (!highestBid || highestBid.bidderId !== user.id) {
                return res.status(400).json({ message: 'You are not the winner of this auction' });
            }

            price = highestBid.amount;
        }

        // Create Order
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                totalAmount: price,
                status: 'completed', // Assuming instant completion for now
                items: {
                    create: {
                        listingId,
                        price,
                        quantity: 1,
                    },
                },
            },
        });

        // Notify seller
        await prisma.notification.create({
            data: {
                userId: listing.ownerId,
                title: 'New Order Placed',
                body: `You have a new order for "${listing.title}" from ${user.name || user.username}. Waiting for payment.`,
                type: 'alert',
                link: `/orders/${order.id}`,
            },
        });

        return res.status(201).json(order);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
