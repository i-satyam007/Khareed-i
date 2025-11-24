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

        const { listingId, amount } = req.body;

        if (!listingId || !amount) {
            return res.status(400).json({ message: "Listing ID and amount are required" });
        }

        // Fetch listing to verify existence and auction status
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        if (!listing.isAuction) {
            return res.status(400).json({ message: "This item is not for auction" });
        }

        if (listing.ownerId === user.id) {
            return res.status(400).json({ message: "You cannot bid on your own listing" });
        }

        if (amount <= listing.price) {
            return res.status(400).json({ message: `Bid must be higher than current price (₹${listing.price})` });
        }

        // Create Bid and Update Listing Price in a transaction
        const bid = await prisma.$transaction(async (tx) => {
            const newBid = await tx.bid.create({
                data: {
                    listingId: listing.id,
                    bidderId: user.id,
                    amount: amount,
                },
            });

            await tx.listing.update({
                where: { id: listing.id },
                data: { price: amount },
            });

            // Create notification for seller
            await tx.notification.create({
                data: {
                    userId: listing.ownerId,
                    title: "New Bid!",
                    body: `New bid of ₹${amount} on "${listing.title}" by ${user.name || user.username}.`,
                },
            });

            return newBid;
        });

        return res.status(201).json(bid);
    } catch (error) {
        console.error("Error placing bid:", error);
        return res.status(500).json({ message: "Internal server error", error: String(error) });
    }
}
