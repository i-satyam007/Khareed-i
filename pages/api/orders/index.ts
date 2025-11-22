import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { getUser } from "../../../lib/getUser";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const user = await getUser(req);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { listingId } = req.body;

        if (!listingId) {
            return res.status(400).json({ message: "Listing ID is required" });
        }

        // Fetch listing to verify existence and price
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        if (listing.ownerId === user.id) {
            return res.status(400).json({ message: "You cannot buy your own listing" });
        }

        if (listing.status === "sold") {
            return res.status(400).json({ message: "This item has already been sold" });
        }

        // Create Order and OrderItem in a transaction
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId: user.id,
                    amount: listing.price,
                    status: "pending",
                    items: {
                        create: {
                            listingId: listing.id,
                            price: listing.price,
                            quantity: 1,
                        },
                    },
                },
                include: {
                    items: true,
                },
            });

            // Update listing status
            await tx.listing.update({
                where: { id: listing.id },
                data: { status: "sold" },
            });

            // Create notification for seller
            await tx.notification.create({
                data: {
                    userId: listing.ownerId,
                    title: "Item Sold!",
                    body: `Your item "${listing.title}" has been sold to ${user.name || user.username}.`,
                },
            });

            return newOrder;
        });

        return res.status(201).json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
