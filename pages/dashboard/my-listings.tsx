import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { User, Package, ShoppingBag, LogOut, Edit2, Trash2, Eye, Clock } from 'lucide-react';

// Mock Data
const MY_LISTINGS = [
    { id: 1, title: "Scientific Calculator FX-991ES", price: 650, status: "Active", views: 45, posted: "2 days ago", image: null },
    { id: 2, title: "IPM Quant Book Bundle", price: 1200, status: "Sold", views: 120, posted: "1 week ago", image: null },
    { id: 3, title: "Table Lamp", price: 400, status: "Active", views: 12, posted: "5 hours ago", image: null },
];

export default function MyListingsPage() {
    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this listing?")) {
            alert(`Listing ${id} deleted (Simulation)`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head>
                <title>My Listings | Khareed-i</title>
            </Head>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Navigation (Reused - ideally a component) */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 bg-kh-purple/5 border-b border-gray-100 text-center">
                                <div className="w-20 h-20 bg-kh-purple/20 rounded-full flex items-center justify-center text-2xl font-bold text-kh-purple mx-auto mb-3">S</div>
                                <h2 className="font-bold text-gray-900">Satyam Kumar</h2>
                                <p className="text-xs text-gray-500">@satyam_k</p>
                            </div>

                            <nav className="p-2">
                                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-xl transition-colors">
                                    <User className="h-5 w-5" /> My Profile
                                </Link>
                                <Link href="/dashboard/my-listings" className="flex items-center gap-3 px-4 py-3 bg-purple-50 text-kh-purple font-medium rounded-xl transition-colors">
                                    <Package className="h-5 w-5" /> My Listings
                                </Link>
                                <Link href="/dashboard/my-orders" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-xl transition-colors">
                                    <ShoppingBag className="h-5 w-5" /> My Orders
                                </Link>
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors mt-2">
                                    <LogOut className="h-5 w-5" /> Sign Out
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                                <Link href="/listings/create" className="text-sm font-bold text-white bg-kh-purple px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                    + New Listing
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {MY_LISTINGS.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-300 transition-all bg-gray-50/50">

                                        {/* Image Placeholder */}
                                        <div className="w-full sm:w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>

                                        {/* Details */}
                                        <div className="flex-1 text-center sm:text-left">
                                            <h3 className="font-bold text-gray-900">{item.title}</h3>
                                            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-gray-500 mt-1">
                                                <span className="font-bold text-gray-900">₹{item.price}</span>
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.posted}</span>
                                                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {item.views} views</span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                                            }`}>
                                            {item.status}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-gray-500 hover:text-kh-purple hover:bg-purple-50 rounded-lg transition-colors" title="Edit">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
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
