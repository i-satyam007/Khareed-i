import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import GroupOrderCard from '../../components/GroupOrderCard';
import { Plus, Search, Filter } from 'lucide-react';
import useSWR from 'swr';

export default function GroupOrdersPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: groupOrders = [], isLoading } = useSWR('/api/group-orders', fetcher);

    const filteredOrders = Array.isArray(groupOrders) ? groupOrders.filter((order: any) =>
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.creator?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head>
                <title>Active Group Orders | Khareed-i</title>
            </Head>

            <div className="container mx-auto px-4 py-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Group Orders</h1>
                        <p className="text-gray-500 text-sm mt-1">Join an existing cart to split delivery fees or start your own.</p>
                    </div>

                    <Link href="/group-orders/create" className="inline-flex items-center justify-center gap-2 bg-kh-purple hover:bg-purple-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-lg shadow-purple-900/20">
                        <Plus className="h-5 w-5" />
                        Start Group Order
                    </Link>
                </div>

                {/* Search & Filter */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by platform, title, or host..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple transition-all"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors">
                        <Filter className="h-4 w-4" /> Filter
                    </button>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="text-center py-20">Loading...</div>
                ) : filteredOrders.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOrders.map((order: any) => (
                            <GroupOrderCard
                                key={order.id}
                                id={order.id}
                                platform={order.platform}
                                title={order.title}
                                cutoff={new Date(order.cutoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                minCart={order.minOrderValue ? `Min ₹${order.minOrderValue}` : "No min"}
                                host={`${order.creator?.name} (${order.creator?.hostel || 'Unknown'})`}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No group orders found</h3>
                        <p className="text-gray-500 text-sm mt-1">Try adjusting your search or start a new one.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
