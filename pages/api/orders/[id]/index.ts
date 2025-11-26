import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getUser } from '../../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const orderId = parseInt(id as string);

    if (isNaN(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
    }

    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    items: {
                        include: {
                            listing: {
                                include: {
                                    owner: true
                                }
                            }
                        }
                    },
                    groupOrder: {
                        include: {
                            creator: true
                        }
                    }
                }
            });

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Access control: User must be buyer or seller
            const isBuyer = order.userId === user.id;
            const isSeller = (order.items.length > 0 && order.items[0].listing?.ownerId === user.id) ||
                (order.groupOrder?.creatorId === user.id);

            if (!isBuyer && !isSeller) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            // Map totalAmount to amount for frontend compatibility
            return res.status(200).json({ ...order, amount: order.totalAmount });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
