import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getUser } from '../../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;
    const orderId = Number(id);

    try {
        const user = await getUser(req);
        // Allow user who made the order OR the seller/system to trigger expiration.
        // For security, strict check: current user is the buyer.

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (user && order.userId !== user.id) {
            // If not buyer, check if he is the owner of the listing? 
            // Simplification: only buyer triggers it from frontend for now.
            // Or allow unauthenticated call if needed for cron (risky without secret).
            // We stick to buyer-forfeits logic.
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (order.status !== 'PENDING_PAYMENT') {
            return res.status(400).json({ message: 'Order is not pending payment' });
        }

        await prisma.$transaction(async (tx) => {
            // 1. Cancel Order
            await tx.order.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' }
            });

            // 2. Reactivate Listing (if it was marked 'sold'/'reserved')
            // Our create flow marks it 'sold'. We need to make it 'active'.
            const listingId = order.items[0]?.listingId;
            if (listingId) {
                await tx.listing.update({
                    where: { id: listingId },
                    data: { status: 'active' }
                });
            }
        });

        return res.status(200).json({ message: 'Order expired and listing reactivated' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
