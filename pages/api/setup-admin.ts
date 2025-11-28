import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const hashedPassword = await bcrypt.hash('Admin!group5', 10);

        const admin = await prisma.user.upsert({
            where: { email: 'johnkumarsingh010@gmail.com' },
            update: {
                role: 'admin',
                password: hashedPassword,
                username: 'admin',
                name: 'Admin User'
            },
            create: {
                email: 'johnkumarsingh010@gmail.com',
                username: 'admin',
                password: hashedPassword,
                name: 'Admin User',
                role: 'admin'
            },
        });

        return res.status(200).json({ message: 'Admin user setup successful', admin });
    } catch (error) {
        console.error('Admin setup error:', error);
        return res.status(500).json({ error: 'Admin setup failed' });
    } finally {
        await prisma.$disconnect();
    }
}
