import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { Heart, Share2, MapPin, ShieldCheck, Clock, User } from 'lucide-react';

// Mock Data (In real app, fetch based on ID)
const MOCK_PRODUCT = {
    id: 1,
    title: "Scientific Calculator FX-991ES (Barely used)",
    price: 650,
    mrp: 950,
    description: "Bought 6 months ago for exams, barely used since then. Condition is like new. Comes with original cover. Perfect for IPM quant courses.",
    category: "Stationery",
    negotiable: true,
    isAuction: false,
    seller: {
        name: "Aman Gupta",
        hostel: "BH-3, Room 204",
        joined: "Aug 2023",
        rating: 4.8
    },
    images: ["/placeholder.jpg"]
};

export default function ProductDetailsPage() {
    const router = useRouter();
    const { id } = router.query;
    const [activeImage, setActiveImage] = useState(0);

    // In a real app, fetch data here
    const product = MOCK_PRODUCT;
    const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head>
                <title>{product.title} | Khareed-i</title>
            </Head>



            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                    {/* Left: Images */}
                    <div className="space-y-4">
                        <div className="aspect-[4/3] bg-white rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center relative group">
                            {/* Placeholder for Image */}
                            <div className="text-gray-300 flex flex-col items-center">
                                <span className="text-6xl">📷</span>
                                <span className="text-sm mt-2">No Image Available</span>
                            </div>

                            <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full text-gray-500 hover:text-red-500 transition-colors shadow-sm">
                                <Heart className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Thumbnails (Mock) */}
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-20 h-20 bg-white rounded-lg border border-gray-200 shrink-0 cursor-pointer hover:border-kh-purple transition-colors"></div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="flex flex-col">

                        {/* Breadcrumb */}
                        <div className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                            <span>Home</span> / <span>Listings</span> / <span className="text-gray-900 font-medium">{product.category}</span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                                <span className="text-lg text-gray-400 line-through">₹{product.mrp}</span>
                            </div>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">{discount}% OFF</span>
                            {product.negotiable && (
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md border border-blue-100">Negotiable</span>
                            )}
                        </div>

                        {/* Seller Info Card */}
                        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-kh-purple/10 rounded-full flex items-center justify-center text-kh-purple font-bold">
                                    {product.seller.name[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{product.seller.name}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {product.seller.hostel}
                                    </p>
                                </div>
                            </div>
                            <button className="text-xs font-medium text-kh-purple border border-kh-purple px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                                View Profile
                            </button>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Description</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto space-y-3">
                            <div className="flex gap-4">
                                <button className="flex-1 bg-kh-red hover:bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-900/20 transition-all transform active:scale-[0.98]">
                                    Buy Now
                                </button>
                                <button className="flex-1 bg-white border-2 border-gray-200 hover:border-kh-purple text-gray-700 font-bold py-3.5 rounded-xl transition-all">
                                    Make an Offer
                                </button>
                            </div>

                            <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 py-2">
                                <Share2 className="h-4 w-4" /> Share this listing
                            </button>
                        </div>

                        {/* Safety Tip */}
                        <div className="mt-6 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-3">
                            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-blue-800">Safety Tip</p>
                                <p className="text-[11px] text-blue-600 mt-0.5">
                                    Always inspect the item in person before making the final payment. Meet in public areas like the Common Room or Mess.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
