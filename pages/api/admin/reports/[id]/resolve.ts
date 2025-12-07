import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { getUser } from '../../../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const user = await getUser(req);
    // Assuming we have an admin role logic, for now anyone "can" hit this if we don't strict check
    // But let's check basic auth
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Ideally check if user.role === 'admin'. Assuming schema has role, it does (default 'user')
    if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.query;
    const reportId = Number(id);
    const { action, adminComment } = req.body; // 'SUSPICIOUS' | 'FALSE_ALARM'

    if (!['SUSPICIOUS', 'FALSE_ALARM'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action' });
    }

    try {
        const report = await prisma.report.findUnique({
            where: { id: reportId }
        });

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (report.status !== 'PENDING') {
            return res.status(400).json({ message: 'Report already resolved' });
        }

        // Transaction to update Report and User Penalty
        await prisma.$transaction(async (tx) => {
            if (action === 'SUSPICIOUS') {
                // Penalize Seller (Reported User)
                await tx.user.update({
                    where: { id: report.reportedId },
                    data: {
                        trustScorePenalty: { increment: 10 }
                    }
                });

                await tx.report.update({
                    where: { id: reportId },
                    data: {
                        status: 'RESOLVED_SUSPICIOUS',
                        adminComment: adminComment || "Marked as suspicious activity."
                    }
                });
            } else {
                // False Alarm -> Penalize Reporter (Buyer)
                await tx.user.update({
                    where: { id: report.reporterId },
                    data: {
                        trustScorePenalty: { increment: 10 }
                    }
                });

                await tx.report.update({
                    where: { id: reportId },
                    data: {
                        status: 'RESOLVED_FALSE',
                        adminComment: adminComment || "Marked as false alarm."
                    }
                });
            }
        });

        return res.status(200).json({ message: 'Report resolved successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
