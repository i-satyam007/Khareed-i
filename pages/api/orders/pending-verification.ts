import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUser } from '../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Find orders where the current user is the seller (owner of listing or creator of group order)
        // AND status is VERIFICATION_PENDING
        const orders = await prisma.order.findMany({
            where: {
                AND: [
                    {
                        paymentStatus: {
                            notIn: ['VERIFIED', 'REJECTED', 'COMPLETED']
                        }
                    },
                    {
                        OR: [
                            { paymentStatus: 'VERIFICATION_PENDING' },
                            {
                                AND: [
                                    { paymentStatus: 'PENDING' },
                                    {
                                        OR: [
                                            { items: { some: { listing: { paymentMethods: { has: 'CASH' } } } } },
                                            { groupOrder: { paymentMethods: { has: 'CASH' } } }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        OR: [
                            {
                                items: {
                                    some: {
                                        listing: {
                                            ownerId: user.id
                                        }
                                    }
                                }
                            },
                            {
                                groupOrder: {
                                    creatorId: user.id
                                }
                            }
                        ]
                    }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    }
                },
                items: {
                    include: {
                        listing: true
                    }
                },
                groupOrder: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        // Calculate total amount for each order (if not already stored correctly)
        const formattedOrders = orders.map(order => {
            let amount = order.totalAmount;
            if (amount === 0 && order.items) {
                amount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            }
            return { ...order, amount };
        });

        return res.status(200).json(formattedOrders);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : String(error) });
    }
}
