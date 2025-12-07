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
        const orders = await prisma.order.findMany({
            where: {
                userId: user.id
            },
            include: {
                items: {
                    include: {
                        listing: {
                            include: {
                                owner: {
                                    select: { id: true, name: true, username: true }
                                }
                            }
                        }
                    }
                },
                groupOrder: {
                    include: {
                        creator: {
                            select: { id: true, name: true, username: true }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedOrders = orders.map(order => {
            // Determine Title, Seller, Type
            let title = "Order";
            let seller = "Unknown";
            let sellerId = 0;
            let type = "Purchase";

            if (order.groupOrder) {
                type = "Group Order";
                title = order.groupOrder.title;
                seller = order.groupOrder.creator.name || order.groupOrder.creator.username;
                sellerId = order.groupOrder.creator.id;
            } else if (order.items.length > 0) {
                // Handle Regular Orders or Ad-hoc items
                const firstItem = order.items[0];
                if (firstItem.listing) {
                    title = firstItem.listing.title;
                    if (order.items.length > 1) title += ` + ${order.items.length - 1} more`;
                    seller = firstItem.listing.owner.name || firstItem.listing.owner.username;
                    sellerId = firstItem.listing.owner.id;
                } else {
                    // Ad-hoc item without listing (fallback)
                    title = firstItem.itemName || "Item";
                    if (order.items.length > 1) title += ` + ${order.items.length - 1} more`;
                    seller = "Group Order"; // Should ideally be covered by groupOrder check above
                }
            }

            let amount = order.totalAmount;
            if (amount === 0) {
                amount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            }

            return {
                id: order.id,
                trackingId: order.trackingId,
                type,
                title,
                price: amount,
                date: new Date(order.createdAt).toLocaleDateString(),
                status: order.status,
                paymentStatus: order.paymentStatus,
                deliveryStatus: order.deliveryStatus,
                seller,
                sellerId,
                totalAmount: amount,
                createdAt: order.createdAt,
                items: order.items.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    itemName: item.itemName,
                    listing: item.listing ? {
                        id: item.listing.id,
                        title: item.listing.title,
                        imagePath: item.listing.imagePath
                    } : null
                }))
            };
        });

        return res.status(200).json(formattedOrders);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
