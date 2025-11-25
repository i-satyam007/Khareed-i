import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getUser } from '../../../../lib/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const groupOrder = await prisma.groupOrder.findUnique({
                where: { id: Number(id) },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            hostel: true,
                            phone: true,
                        },
                    },
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    hostel: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!groupOrder) {
                return res.status(404).json({ message: 'Group order not found' });
            }

            // Transform participants to group items by user
            const participantsMap = new Map();

            groupOrder.participants.forEach((item) => {
                if (!participantsMap.has(item.userId)) {
                    participantsMap.set(item.userId, {
                        id: item.userId,
                        name: item.user.name,
                        items: [],
                    });
                }
                participantsMap.get(item.userId).items.push({
                    id: item.id,
                    name: item.itemName,
                    price: item.amount,
                    quantity: item.quantity,
                });
            });

            const formattedParticipants = Array.from(participantsMap.values());

            return res.status(200).json({ ...groupOrder, participants: formattedParticipants });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to fetch group order details' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
