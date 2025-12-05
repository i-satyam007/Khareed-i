import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { getUser } from '../../../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const user = await getUser(req);
    if (!user || user.role !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    const { decision, comment } = req.body; // decision: 'APPROVE' (Buyer correct) or 'REJECT' (Seller correct)

    if (!id || !decision || !comment) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    try {
        const report = await prisma.report.findUnique({
            where: { id: Number(id) },
            include: { order: { include: { items: { include: { listing: true } } } } }
        });

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // 1. Update Report Status
            await tx.report.update({
                where: { id: Number(id) },
                data: {
                    status: decision === 'APPROVE' ? 'RESOLVED_APPROVE' : 'RESOLVED_REJECT',
                    adminComment: comment
                }
            });

            if (decision === 'APPROVE') {
                // Buyer was correct. Seller wrongly rejected payment.
                // Action: Penalize Seller, Verify Payment, Notify Both.

                // Penalize Seller
                await tx.user.update({
                    where: { id: report.reportedId },
                    data: { failedPaymentCount: { increment: 1 } }
                });

                // Verify Payment (Force Approve)
                await tx.order.update({
                    where: { id: report.orderId },
                    data: { status: 'completed', paymentStatus: 'VERIFIED' } // Assuming 'completed' is the verified state based on previous context
                });

                // Notify Seller (Penalty)
                await tx.notification.create({
                    data: {
                        userId: report.reportedId,
                        title: 'Admin Resolved Dispute: Penalty Applied',
                        body: `Admin approved buyer's report for Order #${report.orderId}. You wrongly rejected a valid payment. Your Trust Score has been reduced. Admin Comment: ${comment}`,
                        type: 'alert',
                        link: `/orders/${report.orderId}`
                    }
                });

                // Notify Buyer (Success)
                await tx.notification.create({
                    data: {
                        userId: report.reporterId,
                        title: 'Dispute Resolved in Your Favor',
                        body: `Admin approved your report for Order #${report.orderId}. Payment is now verified. Admin Comment: ${comment}`,
                        type: 'success',
                        link: `/orders/${report.orderId}`
                    }
                });

            } else {
                // Seller was correct. Buyer made a false report.
                // Action: Penalize Buyer, Keep Payment Rejected, Notify Both.

                // Penalize Buyer
                await tx.user.update({
                    where: { id: report.reporterId },
                    data: { failedPaymentCount: { increment: 1 } }
                });

                // Notify Buyer (Penalty)
                await tx.notification.create({
                    data: {
                        userId: report.reporterId,
                        title: 'Dispute Rejected: Penalty Applied',
                        body: `Admin rejected your report for Order #${report.orderId}. Your Trust Score has been reduced. Admin Comment: ${comment}`,
                        type: 'alert',
                        link: `/orders/${report.orderId}`
                    }
                });

                // Notify Seller (Success)
                await tx.notification.create({
                    data: {
                        userId: report.reportedId,
                        title: 'Dispute Resolved in Your Favor',
                        body: `Admin rejected the buyer's false report for Order #${report.orderId}. No action needed. Admin Comment: ${comment}`,
                        type: 'success',
                        link: `/orders/${report.orderId}`
                    }
                });
            }
        });

        return res.status(200).json({ message: 'Resolved successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
