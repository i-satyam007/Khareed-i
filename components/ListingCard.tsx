import React from 'react';
import Link from 'next/link';
import { Heart, Clock, Gavel, Banknote, QrCode } from 'lucide-react';

type ListingProps = {
    id: number;
    title: string;
    price: number;
    mrp: number;
    image?: string;
    imagePath?: string;
    negotiable: boolean;
    isAuction?: boolean;
    endTime?: string;
    postedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    condition?: string;
    category?: string;
    bids?: any[];
    paymentMethods?: string[];
    owner?: {
        name: string;
        avatar?: string;
    };
};

export default function ListingCard({ id, title, price, mrp, image, imagePath, negotiable, isAuction, endTime, postedAt, createdAt, updatedAt, condition, category, bids, paymentMethods, owner }: ListingProps) {
    const discount = Math.round(((mrp - price) / mrp) * 100);
    const displayImage = image || imagePath;

    const timeAgo = (date: string | Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    const displayTime = postedAt ? timeAgo(postedAt) : (createdAt ? timeAgo(createdAt) : 'Recently');

    // Check if edited (if updatedAt exists and is > 1 min after createdAt)
    const isEdited = () => {
        if (!updatedAt || !createdAt) return false;
        const diff = new Date(updatedAt).getTime() - new Date(createdAt).getTime();
        return diff > 60000; // 1 minute buffer
    };

    const editedText = isEdited() ? ` • Edited ${timeAgo(updatedAt!)}` : "";

    const [inWatchlist, setInWatchlist] = React.useState(false);
    // Check if user has this item in watchlist (requires user context, skipping for now or fetching separately)

    const toggleWatchlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await fetch(`/api/listings/${id}/watchlist`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setInWatchlist(data.inWatchlist);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="group bg-kh-surface border border-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-kh-purple/5 transition-all duration-300 flex flex-col h-full relative">
            {/* Image Placeholder */}
            <div className="aspect-[4/3] bg-gray-900 relative overflow-hidden">
                {displayImage ? (
                    <img src={displayImage} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 bg-gray-900">
                        <span className="text-xs">No Image</span>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {isAuction && (
                        <span className="px-2 py-0.5 bg-purple-900/40 text-purple-300 text-[10px] font-bold rounded-md border border-purple-500/20 shadow-sm flex items-center gap-1 backdrop-blur-sm">
                            <Gavel className="h-3 w-3" />
                            Auction
                        </span>
                    )}
                    {negotiable && !isAuction && (
                        <span className="px-2 py-0.5 bg-blue-900/40 text-blue-300 text-[10px] font-bold rounded-md border border-blue-500/20 backdrop-blur-sm">
                            Negotiable
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={toggleWatchlist}
                    className={`absolute top-2 right-2 p-1.5 backdrop-blur-md rounded-full transition-colors ${inWatchlist ? 'bg-red-500/20 text-red-500' : 'bg-black/40 text-gray-300 hover:text-red-400'}`}
                >
                    <Heart className={`h-4 w-4 ${inWatchlist ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <Link href={`/listings/${id}`} className="block">
                    <h3 className="text-sm font-medium text-kh-dark line-clamp-2 mb-1 group-hover:text-kh-red transition-colors" title={title}>
                        {title}
                    </h3>
                </Link>

                <div className="mt-auto pt-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-kh-dark">₹{price}</span>
                        <span className="text-xs text-gray-500 line-through">₹{mrp}</span>
                        <span className="text-xs font-bold text-green-500">{discount}% OFF</span>
                    </div>

                    {/* Auction Timer or Posted Time */}
                    <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between text-[10px] text-gray-400">
                        {isAuction && endTime ? (
                            <div className="flex flex-col items-end w-full">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-1 text-orange-500 font-bold">
                                        <Clock className="h-3 w-3" />
                                        <span>Ends in {endTime}</span>
                                    </div>
                                    {/* Owner Avatar for Auction */}
                                    {owner && (
                                        <div className="flex items-center gap-1.5" title={`Sold by ${owner.name}`}>
                                            <div className="w-5 h-5 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
                                                {owner.avatar ? (
                                                    <img src={owner.avatar} alt={owner.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-gray-500">
                                                        {owner.name[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-gray-400 truncate max-w-[60px]">{owner.name.split(' ')[0]}</span>
                                        </div>
                                    )}
                                </div>
                                {bids && bids.length > 0 && (
                                    <div className="text-[10px] text-gray-500 mt-1 w-full text-right">
                                        Top Bid by <span className="font-bold text-kh-dark">{bids[0].bidder?.name || bids[0].bidder?.username || 'User'}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    {/* Owner Avatar for Regular Listing */}
                                    {owner && (
                                        <div className="flex items-center gap-1.5" title={`Sold by ${owner.name}`}>
                                            <div className="w-5 h-5 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
                                                {owner.avatar ? (
                                                    <img src={owner.avatar} alt={owner.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-gray-500">
                                                        {owner.name[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-medium text-kh-dark leading-none">{owner.name.split(' ')[0]}</span>
                                                <span className="text-[9px] text-gray-500 leading-none mt-0.5">{displayTime}</span>
                                            </div>
                                        </div>
                                    )}
                                    {!owner && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{displayTime}{editedText}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    {paymentMethods?.includes('CASH') && (
                                        <div className="p-1 bg-green-900/20 rounded text-green-500" title="Cash on Delivery">
                                            <Banknote className="h-3 w-3" />
                                        </div>
                                    )}
                                    {paymentMethods?.includes('UPI') && (
                                        <div className="p-1 bg-purple-900/20 rounded text-purple-400" title="UPI / QR Code">
                                            <QrCode className="h-3 w-3" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
