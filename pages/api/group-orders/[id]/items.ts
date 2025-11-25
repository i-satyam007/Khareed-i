import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getUser } from '../../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    const groupOrderId = Number(id);

    if (req.method === 'POST') {
        const { name, price, quantity = 1 } = req.body;

        if (!name || !price) {
            return res.status(400).json({ message: 'Missing item details' });
        }

        try {
            // Verify group order exists and is open
            const groupOrder = await prisma.groupOrder.findUnique({
                where: { id: groupOrderId },
            });

            if (!groupOrder) {
                return res.status(404).json({ message: 'Group order not found' });
            }

            if (groupOrder.status !== 'open') {
                return res.status(400).json({ message: 'Group order is closed' });
            }

            if (new Date() > groupOrder.cutoff) {
                return res.status(400).json({ message: 'Cutoff time has passed' });
            }

            const item = await prisma.groupOrderItem.create({
                data: {
                    groupOrderId,
                    userId: user.id,
                    itemName: name,
                    amount: Number(price),
                    quantity: Number(quantity),
                },
            });

            return res.status(201).json(item);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to add item' });
        }
    }

    if (req.method === 'DELETE') {
        const { itemId } = req.body;

        if (!itemId) {
            return res.status(400).json({ message: 'Missing item ID' });
        }

        try {
            const item = await prisma.groupOrderItem.findUnique({
                where: { id: Number(itemId) },
            });

            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }

            if (item.userId !== user.id) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            await prisma.groupOrderItem.delete({
                where: { id: Number(itemId) },
            });

            return res.status(200).json({ message: 'Item removed' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to remove item' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
