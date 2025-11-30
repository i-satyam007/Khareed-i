import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { User, Package, ShoppingBag, LogOut, ExternalLink, CheckCircle, Clock, Star, Heart, AlertCircle } from 'lucide-react';
import { useUser } from '@/lib/hooks/useUser';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MyOrdersPage() {
    const { user } = useUser();
    const { data: orders, error, isLoading } = useSWR('/api/orders', fetcher);

    const handleRate = (orderId: number) => {
        alert("Rating feature coming soon!");
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head>
                <title>My Orders | Khareed-i</title>
            </Head>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 bg-kh-purple/5 border-b border-gray-100 text-center">
                                <div className="w-20 h-20 bg-kh-purple/20 rounded-full flex items-center justify-center text-2xl font-bold text-kh-purple mx-auto mb-3 overflow-hidden">
                                    {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user.name?.[0]}
                                </div>
                                <h2 className="font-bold text-gray-900">{user.name}</h2>
                                <p className="text-xs text-gray-500">@{user.username}</p>
                            </div>

                            <nav className="p-2 space-y-1">
                                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-xl transition-colors">
                                    <User className="h-5 w-5" /> My Profile
                                </Link>
                                <Link href="/dashboard?tab=watchlist" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-xl transition-colors">
                                    <Heart className="h-5 w-5" /> My Watchlist
                                </Link>
                                <Link href="/dashboard/my-listings" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-xl transition-colors">
                                    <Package className="h-5 w-5" /> My Listings
                                </Link>
                                <Link href="/dashboard/my-orders" className="flex items-center gap-3 px-4 py-3 bg-purple-50 text-kh-purple font-medium rounded-xl transition-colors">
                                    <ShoppingBag className="h-5 w-5" /> My Orders
                                </Link>
                                <Link href="/api/auth/logout" className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors mt-2">
                                    <LogOut className="h-5 w-5" /> Sign Out
                                </Link>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>

                            {isLoading ? (
                                <div className="text-center py-12 text-gray-500">Loading orders...</div>
                            ) : error ? (
                                <div className="text-center py-12 text-red-500">Failed to load orders.</div>
                            ) : orders?.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>You haven't placed any orders yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order: any) => {
                                        const firstItem = order.items?.[0]?.listing;
                                        const itemCount = order.items?.length || 0;
                                        const title = firstItem ? (itemCount > 1 ? `${firstItem.title} + ${itemCount - 1} more` : firstItem.title) : `Order #${order.id}`;
                                        const sellerName = firstItem?.owner?.name || "Unknown Seller";

                                        return (
                                            <div key={order.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-300 transition-all bg-gray-50/50">

                                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-blue-100 text-blue-600`}>
                                                        📦
                                                    </div>
                                                    <div>
                                                        <Link href={`/orders/${order.id}`} className="font-bold text-gray-900 text-sm hover:text-kh-purple transition-colors">
                                                            {title}
                                                        </Link>
                                                        <p className="text-xs text-gray-500 flex items-center gap-2">
                                                            <span>{new Date(order.createdAt).toLocaleDateString()}</span> • <span>Seller: {sellerName}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-900">₹{order.total}</p>
                                                        <p className={`text-xs font-bold ${order.status === "COMPLETED" ? "text-green-600" : "text-orange-600"
                                                            }`}>
                                                            {order.status}
                                                        </p>
                                                    </div>

                                                    {order.status === "COMPLETED" && (
                                                        <button
                                                            onClick={() => handleRate(order.id)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-lg hover:bg-yellow-100 transition-colors"
                                                        >
                                                            <Star className="h-3 w-3" /> Rate
                                                        </button>
                                                    )}
                                                </div>

                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
}
