import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { search, category } = req.query;

    try {
        const where: any = {};

        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        if (category) {
            where.category = category as string;
        }

        const listings = await prisma.listing.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                owner: {
                    select: { name: true, hostel: true },
                },
            },
        });

        res.status(200).json(listings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
