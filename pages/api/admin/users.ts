import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getUser } from '@/lib/getUser';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getUser(req);

    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const { sort = 'createdAt', order = 'desc' } = req.query;
            const orderBy = { [sort as string]: order };

            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    role: true,
                    avatar: true,
                    failedPaymentCount: true,
                    // @ts-ignore
                    trustScorePenalty: true,
                    blacklistUntil: true,
                    createdAt: true
                },
                orderBy
            });
            return res.json(users);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
    }

    if (req.method === 'PUT') {
        const { id, action } = req.query;

        if (!id || !action) return res.status(400).json({ error: 'Missing id or action' });

        try {
            if (action === 'ban') {
                // Ban for 1 year
                const banDate = new Date();
                banDate.setFullYear(banDate.getFullYear() + 1);

                await prisma.user.update({
                    where: { id: Number(id) },
                    data: { blacklistUntil: banDate }
                });
            } else if (action === 'unban') {
                await prisma.user.update({
                    where: { id: Number(id) },
                    data: { blacklistUntil: null }
                });
            }
            return res.json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Action failed' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
