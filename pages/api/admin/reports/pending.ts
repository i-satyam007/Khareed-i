import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getUser } from '../../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const user = await getUser(req);
    if (!user || user.role !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const reports = await prisma.report.findMany({
            where: { status: 'PENDING' },
            include: {
                reporter: { select: { id: true, name: true, email: true } },
                reported: { select: { id: true, name: true, email: true } },
                order: { select: { id: true, paymentComment: true, paymentScreenshot: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json(reports);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
