import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { getUser } from '../../../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const user = await getUser(req);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.query;
    const { action, adminComment } = req.body; // action: 'APPROVE' or 'REJECT'

    if (!id || !action) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const reportId = Number(id);
        const report = await prisma.report.findUnique({
            where: { id: reportId },
            include: { listing: true }
        });

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (report.status !== 'PENDING') {
            return res.status(400).json({ message: 'Report already resolved' });
        }

        await prisma.$transaction(async (tx) => {
            if (action === 'APPROVE') {
                // Report is VALID. Punish the Reported User (Seller).
                // 1. Delete Listing if applicable
                if (report.listingId) {
                    await tx.listing.update({
                        where: { id: report.listingId },
                        data: { status: 'deleted' }
                    });
                }

                // 2. Reduce Trust Score of Reported User by 10% (add 10 to penalty)
                // Note: Trust Score is usually calculated as 100 - penalties. So we add to penalty.
                // Assuming penalty is an integer representing percentage points lost.
                await tx.user.update({
                    where: { id: report.reportedId },
                    data: {
                        trustScorePenalty: { increment: 10 }
                    }
                });

                // 3. Mark Report as Resolved
                await tx.report.update({
                    where: { id: reportId },
                    data: {
                        status: 'RESOLVED_APPROVE',
                        adminComment
                    }
                });

                // Notify Reporter
                await tx.notification.create({
                    data: {
                        userId: report.reporterId,
                        title: 'Report Update',
                        body: 'Your report has been approved. Thank you for keeping the community safe.',
                        type: 'system'
                    }
                });

                // Notify Reported User
                await tx.notification.create({
                    data: {
                        userId: report.reportedId,
                        title: 'Listing Removed',
                        body: 'Your listing was removed due to a community report. Your trust score has been affected.',
                        type: 'system'
                    }
                });

            } else if (action === 'REJECT') {
                // Report is INVALID/FALSE. Punish the Reporter.

                // 1. Reduce Trust Score of Reporter by 10%
                await tx.user.update({
                    where: { id: report.reporterId },
                    data: {
                        trustScorePenalty: { increment: 10 }
                    }
                });

                // 2. Mark Report as Resolved
                await tx.report.update({
                    where: { id: reportId },
                    data: {
                        status: 'RESOLVED_REJECT',
                        adminComment
                    }
                });

                // Notify Reporter
                await tx.notification.create({
                    data: {
                        userId: report.reporterId,
                        title: 'Report Rejected',
                        body: 'Your report was reviewed and found to be invalid. Your trust score has been affected for false reporting.',
                        type: 'system'
                    }
                });
            }
        });

        return res.status(200).json({ message: 'Report resolved successfully' });

    } catch (error) {
        console.error('Resolve error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
