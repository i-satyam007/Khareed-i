import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { User, Package, ShoppingBag, LogOut, ExternalLink, CheckCircle, Clock, Star, Heart } from 'lucide-react';
import { useUser } from '@/lib/hooks/useUser';

// Mock Data (Replace with API fetch later)
const MY_ORDERS = [
    { id: 101, type: "Purchase", title: "Mattress Topper", price: 800, date: "20 Nov 2024", status: "Completed", seller: "Rohan", sellerId: 2 },
    { id: 99, type: "Group Order", title: "Midnight snacks run (Blinkit)", price: 145, date: "Today", status: "Open", seller: "Aman (Host)", sellerId: 3 },
    { id: 102, type: "Purchase", title: "Desk Lamp", price: 350, date: "15 Nov 2024", status: "Completed", seller: "Sneha", sellerId: 4 },
];

export default function MyOrdersPage() {
    const { user } = useUser();

    if (!user) return <div>Loading...</div>;

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

                            <div className="space-y-4">
                                {MY_ORDERS.map((order) => (
                                    <div key={order.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-300 transition-all bg-gray-50/50">

                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${order.type === "Group Order" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                                                }`}>
                                                {order.type === "Group Order" ? "🍕" : "📦"}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm">{order.title}</h3>
                                                <p className="text-xs text-gray-500 flex items-center gap-2">
                                                    <span>{order.date}</span> • <Link href={`/users/${order.sellerId}`} className="hover:underline hover:text-kh-purple">{order.seller}</Link>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">₹{order.price}</p>
                                                <p className={`text-xs font-bold ${order.status === "Completed" ? "text-green-600" : "text-orange-600"
                                                    }`}>
                                                    {order.status}
                                                </p>
                                            </div>

                                            {order.status === "Completed" && (
                                                <button className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-lg hover:bg-yellow-100 transition-colors">
                                                    <Star className="h-3 w-3" /> Rate
                                                </button>
                                            )}
                                        </div>

                                    </div>
                                ))}
                            </div>

                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
}
