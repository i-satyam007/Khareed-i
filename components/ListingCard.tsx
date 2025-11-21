import React from 'react';
import Link from 'next/link';
import { Heart, Clock } from 'lucide-react';

type ListingProps = {
    id: number;
    title: string;
    price: number;
    mrp: number;
    image?: string;
    negotiable: boolean;
    isAuction?: boolean;
    endTime?: string;
};

export default function ListingCard({ id, title, price, mrp, image, negotiable, isAuction, endTime }: ListingProps) {
    const discount = Math.round(((mrp - price) / mrp) * 100);

    return (
        <div className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full relative">
            {/* Image Placeholder */}
            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        <span className="text-xs">No Image</span>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {negotiable && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md border border-blue-100">Negotiable</span>}
                    {isAuction && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md border border-purple-100">Auction</span>}
                </div>

                {/* Wishlist Button */}
                <button className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="h-4 w-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <Link href={`/listings/${id}`} className="block">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-kh-red transition-colors" title={title}>
                        {title}
                    </h3>
                </Link>

                <div className="mt-auto pt-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">₹{price}</span>
                        <span className="text-xs text-gray-400 line-through">₹{mrp}</span>
                        <span className="text-xs font-bold text-green-600">{discount}% OFF</span>
                    </div>

                    {isAuction && endTime && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-md w-fit">
                            <Clock className="h-3 w-3" />
                            <span>Ends in {endTime}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
