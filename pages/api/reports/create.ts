import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUser } from '../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const user = await getUser(req);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { reason, orderId, listingId } = req.body;

        if (!reason || (!orderId && !listingId)) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (orderId && listingId) {
            return res.status(400).json({ message: 'Cannot report both order and listing at the same time' });
        }

        let reportedId: number | null = null;
        let finalOrderId: number | null = null;

        if (orderId) {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: { items: { include: { listing: true } }, groupOrder: { include: { creator: true } } }
            });

            if (!order) return res.status(404).json({ message: 'Order not found' });

            // Determine who to report
            // For simplicity in this context, reporting an order usually reports the seller
            // But an order might have multiple items/sellers. 
            // Existing logic linked report to order, let's keep it simple for now or fetch seller from first item
            // If group order, report creator?
            // Assuming simplified single-seller orders for report logic mostly:
            if (order.items.length > 0 && order.items[0].listing) {
                reportedId = order.items[0].listing.ownerId;
            } else if (order.groupOrder) {
                reportedId = order.groupOrder.creatorId;
            }

            finalOrderId = orderId;
        }

        if (listingId) {
            const listing = await prisma.listing.findUnique({
                where: { id: listingId }
            });
            if (!listing) return res.status(404).json({ message: 'Listing not found' });
            reportedId = listing.ownerId;
        }

        if (!reportedId) {
            return res.status(400).json({ message: 'Could not determine user to report' });
        }

        if (reportedId === user.id) {
            return res.status(400).json({ message: 'Cannot report yourself' });
        }

        const report = await prisma.report.create({
            data: {
                reporterId: user.id,
                reportedId: reportedId,
                orderId: finalOrderId,
                listingId: listingId || null,
                reason,
                status: 'PENDING'
            }
        });

        return res.status(201).json(report);

    } catch (error) {
        console.error('Report error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
