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
            const listings = await prisma.listing.findMany({
                include: { owner: { select: { name: true, email: true } } },
                orderBy: { createdAt: 'desc' }
            });
            return res.json(listings);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch listings' });
        }
    }

    if (req.method === 'PUT') {
        const { id, action } = req.query;

        if (!id || !action) return res.status(400).json({ error: 'Missing id or action' });

        try {
            if (action === 'delete') {
                await prisma.listing.update({
                    where: { id: Number(id) },
                    data: { status: 'deleted' }
                });
            } else if (action === 'approve') {
                await prisma.listing.update({
                    where: { id: Number(id) },
                    data: { status: 'active' }
                });
            }
            return res.json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Action failed' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
