import React from 'react';
import Link from 'next/link';
import { Clock, ShoppingBag } from 'lucide-react';

type GroupOrderProps = {
    id: number;
    platform: "Blinkit" | "BigBasket" | "Swiggy" | "Zomato" | "EatSure";
    title: string;
    cutoff: string;
    minCart: string;
    host: string;
    hostAvatar?: string;
};

function platformColor(platform: GroupOrderProps["platform"]) {
    switch (platform) {
        case "Blinkit": return "bg-yellow-900/30 text-yellow-300 border-yellow-500/20";
        case "BigBasket": return "bg-green-900/30 text-green-300 border-green-500/20";
        case "Swiggy": return "bg-orange-900/30 text-orange-300 border-orange-500/20";
        case "Zomato": return "bg-red-900/30 text-red-300 border-red-500/20";
        case "EatSure": return "bg-purple-900/30 text-purple-300 border-purple-500/20";
        default: return "bg-gray-800 text-gray-300 border-gray-700";
    }
}

export default function GroupOrderCard({ id, platform, title, cutoff, minCart, host, hostAvatar }: GroupOrderProps) {
    return (
        <div className="bg-kh-surface border border-gray-800 rounded-xl p-5 shadow-sm hover:shadow-lg hover:shadow-kh-purple/5 transition-all cursor-pointer flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm ${platformColor(platform)}`}>
                    {platform}
                </span>
                <div className="flex items-center gap-1.5 bg-gray-900 px-2 py-0.5 rounded-full border border-gray-800">
                    <div className="w-4 h-4 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-700">
                        {hostAvatar ? (
                            <img src={hostAvatar} alt="Host" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-gray-500">
                                {host[0]}
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] text-gray-400 truncate max-w-[80px]">Host: {host}</span>
                </div>
            </div>

            <h3 className="font-semibold text-kh-dark text-sm mb-2 line-clamp-1">{title}</h3>

            <div className="mt-auto space-y-1.5 border-t border-dashed border-gray-800 pt-3">
                <div className="flex items-center text-xs text-gray-400 gap-2">
                    <Clock className="h-3.5 w-3.5 text-gray-500" />
                    <span>{cutoff}</span>
                </div>
                <div className="flex items-center text-xs text-gray-400 gap-2">
                    <ShoppingBag className="h-3.5 w-3.5 text-gray-500" />
                    <span>{minCart}</span>
                </div>
            </div>

            <Link href={`/group-orders/${id}`} className="mt-4 block w-full text-center py-2 text-xs font-bold text-kh-purple bg-kh-purple/10 rounded-lg hover:bg-kh-purple/20 transition-colors border border-kh-purple/20">
                Join Order
            </Link>
        </div>
    );
}
