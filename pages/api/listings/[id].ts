import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const listingId = parseInt(id as string);
        if (isNaN(listingId)) {
            return res.status(400).json({ message: "Invalid listing ID" });
        }

        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        // hostel: true, // Temporarily disabled due to DB sync issue
                        // avatar: true,
                    },
                },
            },
        });

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        return res.status(200).json(listing);
    } catch (error) {
        console.error("Error fetching listing:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
