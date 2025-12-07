import React from 'react';
import Link from 'next/link';
import { Clock, ShoppingBag, Banknote, QrCode } from 'lucide-react';

type GroupOrderProps = {
    id: number;
    platform: "Blinkit" | "BigBasket" | "Swiggy" | "Zomato" | "EatSure";
    title: string;
    cutoff: string;
    minCart: string;
    host: string;
    hostAvatar?: string;
    paymentMethods?: string[];
};

function platformColor(platform: GroupOrderProps["platform"]) {
    switch (platform) {
        case "Blinkit": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "BigBasket": return "bg-green-100 text-green-800 border-green-200";
        case "Swiggy": return "bg-orange-100 text-orange-800 border-orange-200";
        case "Zomato": return "bg-red-100 text-red-800 border-red-200";
        case "EatSure": return "bg-purple-100 text-purple-800 border-purple-200";
        default: return "bg-gray-100 text-gray-800";
    }
}

export default function GroupOrderCard({ id, platform, title, cutoff, minCart, host, hostAvatar, paymentMethods }: GroupOrderProps) {
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${platformColor(platform)}`}>
                    {platform}
                </span>
                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                    <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {hostAvatar ? (
                            <img src={hostAvatar} alt="Host" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-gray-500">
                                {host[0]}
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] text-gray-500 truncate max-w-[80px]">Host: {host}</span>
                </div>
            </div>

            <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-1">{title}</h3>

            <div className={`mt-auto space-y-1.5 border-t border-dashed border-gray-100 pt-3`}>
                <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center text-xs text-gray-500 gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{cutoff}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 gap-2">
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span>{minCart}</span>
                        </div>
                    </div>
                    {/* Payment Icons */}
                    <div className="flex gap-1">
                        {paymentMethods?.includes('CASH') && (
                            <div className="p-1 bg-green-50 rounded text-green-700 border border-green-100" title="Cash on Delivery">
                                <Banknote className="h-3.5 w-3.5" />
                            </div>
                        )}
                        {paymentMethods?.includes('UPI') && (
                            <div className="p-1 bg-purple-50 rounded text-purple-700 border border-purple-100" title="UPI / QR Code">
                                <QrCode className="h-3.5 w-3.5" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Link href={`/group-orders/${id}`} className="mt-4 block w-full text-center py-2 text-xs font-semibold text-kh-purple bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-100">
                Join Order
            </Link>
        </div>
    );
}
