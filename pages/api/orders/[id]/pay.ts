import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getUser } from '../../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const orderId = Number(req.query.id);

    if (req.method === 'POST') {
        const { screenshot } = req.body;

        if (!screenshot) {
            return res.status(400).json({ message: 'Screenshot is required' });
        }

        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
            });

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            if (order.userId !== user.id) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            const updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: {
                    paymentScreenshot: screenshot,
                    paymentStatus: 'VERIFICATION_PENDING',
                },
            });

            return res.status(200).json(updatedOrder);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to submit payment' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
