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
        // Find orders where the current user is the seller
        // AND paymentStatus is VERIFIED (or completed)
        // AND deliveryStatus is PENDING (not SHIPPED or DELIVERED)
        const orders = await prisma.order.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { paymentStatus: 'VERIFIED' },
                            { status: 'completed' }
                        ]
                    },
                    { deliveryStatus: 'PENDING' },
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
                createdAt: 'desc'
            }
        });

        // Transform data for the frontend
        const formattedOrders = orders.map((order: any) => {
            let amount = order.totalAmount;
            // If totalAmount is 0, try to calculate it (legacy/fallback)
            if (amount === 0 && order.items && order.items.length > 0) {
                amount = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
            }

            return {
                id: order.id,
                trackingId: order.trackingId,
                title: order.groupOrder ? order.groupOrder.title : (order.items && order.items[0]?.listing?.title || 'Order'),
                type: order.groupOrder ? 'Group Order' : 'Direct Order',
                buyer: order.user ? (order.user.name || order.user.email) : 'Unknown',
                date: new Date(order.createdAt).toLocaleDateString(),
                amount: amount,
                status: order.paymentStatus,
                items: order.items ? order.items.map((item: any) => ({
                    name: item.listing?.title || "Unknown Item",
                    quantity: item.quantity,
                    price: item.price
                })) : []
            };
        });

        return res.status(200).json(formattedOrders);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
