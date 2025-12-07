import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { getUser } from "../../../lib/getUser";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '5mb',
        },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const listingId = parseInt(id as string);

    if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
    }

    if (req.method === "GET") {
        try {
            const user = await getUser(req);

            // First fetch the listing to check ownership and basic details
            let listingCheck = await prisma.listing.findUnique({
                where: { id: listingId },
                select: {
                    id: true,
                    ownerId: true,
                    isAuction: true,
                    status: true,
                    auctionTo: true,
                    title: true,
                    price: true
                }
            });

            if (!listingCheck) {
                return res.status(404).json({ message: "Listing not found" });
            }

            // Lazy Finalization Check
            if (listingCheck.isAuction && listingCheck.status === 'active' && listingCheck.auctionTo && new Date(listingCheck.auctionTo) < new Date()) {
                await prisma.$transaction(async (tx) => {
                    // Find highest bidder
                    const winningBid = await tx.bid.findFirst({
                        where: { listingId },
                        orderBy: { amount: 'desc' },
                        include: { bidder: true }
                    });

                    if (winningBid) {
                        // Mark sold and create order
                        await tx.listing.update({
                            where: { id: listingId },
                            data: { status: 'sold' } // Or 'reserved' until paid? "sold" is safer to stop updates
                        });

                        // Create Order
                        const order = await tx.order.create({
                            data: {
                                userId: winningBid.bidderId,
                                totalAmount: winningBid.amount,
                                status: 'PENDING_PAYMENT',
                                deliveryStatus: 'PENDING',
                                items: {
                                    create: {
                                        listingId: listingId,
                                        price: winningBid.amount,
                                        quantity: 1
                                    }
                                }
                            }
                        });

                        // Notify Winner
                        await tx.notification.create({
                            data: {
                                userId: winningBid.bidderId,
                                title: "Auction Won!",
                                body: `You won the auction for "${listingCheck!.title}"! Please make the payment of ₹${winningBid.amount}.`,
                                type: "alert",
                                link: `/orders/${order.id}/pay`
                            }
                        });

                        // Notify Seller
                        await tx.notification.create({
                            data: {
                                userId: listingCheck!.ownerId,
                                title: "Auction Ended",
                                body: `Your auction for "${listingCheck!.title}" has ended. Waiting for payment from ${winningBid.bidder.name}.`,
                                type: "info",
                                link: `/orders/${order.id}`
                            }
                        });

                    } else {
                        // No bids -> Expired
                        await tx.listing.update({
                            where: { id: listingId },
                            data: { status: 'expired' }
                        });

                        // Notify Seller
                        await tx.notification.create({
                            data: {
                                userId: listingCheck!.ownerId,
                                title: "Auction Expired",
                                body: `Your auction for "${listingCheck!.title}" ended with no bids.`,
                                type: "info",
                                link: `/listings/${listingCheck!.id}`
                            }
                        });
                    }
                });
            }

            const isOwner = user?.id === listingCheck.ownerId;

            const listing = await prisma.listing.findUnique({
                where: { id: listingId },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true,
                            avatar: true,
                        },
                    },
                    bids: {
                        orderBy: { amount: 'desc' },
                        include: {
                            bidder: {
                                select: { name: true, username: true },
                            },
                        },
                    },
                    offers: isOwner ? {
                        orderBy: { createdAt: 'desc' },
                        include: {
                            bidder: {
                                select: { name: true, username: true },
                            },
                        },
                    } : false,
                    reviews: {
                        include: {
                            user: {
                                select: { name: true, avatar: true }
                            }
                        }
                    }
                },
            });

            return res.status(200).json(listing);
        } catch (error) {
            console.error("Error fetching listing:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    else if (req.method === "DELETE") {
        try {
            const user = await getUser(req);
            if (!user) return res.status(401).json({ message: "Unauthorized" });

            const listing = await prisma.listing.findUnique({ where: { id: listingId } });

            if (!listing) return res.status(404).json({ message: "Listing not found" });
            if (listing.ownerId !== user.id) return res.status(403).json({ message: "Forbidden" });

            // Soft delete
            await prisma.$transaction(async (tx) => {
                await tx.listing.update({
                    where: { id: listingId },
                    data: { status: "deleted" },
                });

                // Notify bidders
                const bids = await tx.bid.findMany({
                    where: { listingId },
                    select: { bidderId: true },
                    distinct: ['bidderId'],
                });

                if (bids.length > 0) {
                    await tx.notification.createMany({
                        data: bids.map(bid => ({
                            userId: bid.bidderId,
                            title: "Listing Deleted",
                            body: `The listing "${listing.title}" you bid on has been deleted by the owner.`,
                            type: 'alert'
                        })),
                    });
                }
            });

            return res.status(200).json({ message: "Listing deleted" });
        } catch (error) {
            console.error("Error deleting listing:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    else if (req.method === "PUT") {
        try {
            const user = await getUser(req);
            if (!user) return res.status(401).json({ message: "Unauthorized" });

            const listing = await prisma.listing.findUnique({ where: { id: listingId } });

            if (!listing) return res.status(404).json({ message: "Listing not found" });
            if (listing.ownerId !== user.id) return res.status(403).json({ message: "Forbidden" });

            const { title, description, price, negotiable } = req.body;

            const updatedListing = await prisma.$transaction(async (tx) => {
                // 1. Fetch existing bidders to notify them
                const existingBids = await tx.bid.findMany({
                    where: { listingId },
                    select: { bidderId: true },
                    distinct: ['bidderId'],
                });

                // 2. Delete all bids
                if (existingBids.length > 0) {
                    await tx.bid.deleteMany({
                        where: { listingId },
                    });

                    // 3. Notify bidders
                    await tx.notification.createMany({
                        data: existingBids.map(bid => ({
                            userId: bid.bidderId,
                            title: "Listing Updated & Bids Reset",
                            body: `The listing "${listing.title}" you bid on has been updated. Your bid has been reset. Please review the changes and bid again.`,
                            type: 'alert'
                        })),
                    });
                }

                // 4. Update the listing
                const updated = await tx.listing.update({
                    where: { id: listingId },
                    data: {
                        title,
                        description,
                        price: Number(price),
                        negotiable: Boolean(negotiable),
                        autoSell: Boolean(req.body.autoSell),
                        imagePath: req.body.imagePath || undefined,
                        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
                    },
                });

                return updated;
            });

            return res.status(200).json(updatedListing);
        } catch (error) {
            console.error("Error updating listing:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
