import React, { useState } from 'react';
import Head from 'next/head';
import useSWR from 'swr';
import { Package, ShoppingBag, Clock, MapPin, User, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState<'purchases' | 'sales'>('purchases');

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data, isLoading } = useSWR('/api/orders', fetcher);

    const purchases = data?.purchases || [];
    const sales = data?.sales || [];

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <Head>
                <title>My Orders | Khareed-i</title>
            </Head>

            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4">
                    <h1 className="text-2xl font-bold text-gray-900 py-6">My Activity</h1>
                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('purchases')}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'purchases' ? 'border-kh-purple text-kh-purple' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            My Orders ({purchases.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'sales' ? 'border-kh-purple text-kh-purple' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            My Sales ({sales.length})
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kh-purple"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {(activeTab === 'purchases' ? purchases : sales).length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
                                    {activeTab === 'purchases' ? <ShoppingBag className="h-8 w-8" /> : <Package className="h-8 w-8" />}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No {activeTab} yet</h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    {activeTab === 'purchases'
                                        ? "You haven't bought anything yet. Start exploring!"
                                        : "You haven't sold anything yet. List an item now!"}
                                </p>
                                <Link
                                    href={activeTab === 'purchases' ? "/" : "/listings/create"}
                                    className="inline-block mt-4 text-kh-purple font-bold text-sm hover:underline"
                                >
                                    {activeTab === 'purchases' ? "Browse Listings" : "Create Listing"}
                                </Link>
                            </div>
                        ) : (
                            (activeTab === 'purchases' ? purchases : sales).map((order: any) => (
                                <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                    <div className="flex gap-4">
                                        {/* Image */}
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                                            {order.items[0]?.listing?.imagePath ? (
                                                <img src={order.items[0].listing.imagePath} alt={order.items[0].listing.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">📷</div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 truncate">{order.items[0]?.listing?.title}</h3>
                                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {order.status.toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    {activeTab === 'purchases' ? (
                                                        <>
                                                            <User className="h-4 w-4" />
                                                            <span>Seller: <strong>{order.items[0]?.listing?.owner?.name || "Unknown"}</strong></span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <User className="h-4 w-4" />
                                                            <span>Buyer: <strong>{order.user?.name || "Unknown"}</strong></span>
                                                        </>
                                                    )}
                                                </div>
                                                <p className="font-bold text-gray-900">₹{order.amount}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
