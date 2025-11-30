import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { User, Package, ShoppingBag, LogOut, Edit2, Trash2, Eye, Clock, AlertCircle } from 'lucide-react';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MyListingsPage() {
    const router = useRouter();
    const { data: listings, error, isLoading } = useSWR('/api/users/listings', fetcher);

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
            try {
                const res = await fetch(`/api/listings/${id}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    mutate('/api/users/listings'); // Refresh data
                } else {
                    const errorData = await res.json();
                    alert(errorData.message || "Failed to delete listing");
                }
            } catch (error) {
                console.error(error);
                alert("An error occurred while deleting");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head>
                <title>My Listings | Khareed-i</title>
            </Head>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Navigation */}
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

                            {isLoading ? (
                                <div className="text-center py-12 text-gray-500">Loading listings...</div>
                            ) : error ? (
                                <div className="text-center py-12 text-red-500">Failed to load listings.</div>
                            ) : listings?.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>You haven't listed anything yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {listings.map((item: any) => (
                                        <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-300 transition-all bg-gray-50/50">

                                            {/* Image Placeholder */}
                                            <div className="w-full sm:w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                                {item.imagePath ? (
                                                    <img src={item.imagePath} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Package className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 text-center sm:text-left">
                                                <Link href={`/listings/${item.id}`} className="font-bold text-gray-900 hover:text-kh-purple transition-colors">
                                                    {item.title}
                                                </Link>
                                                <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-gray-500 mt-1">
                                                    <span className="font-bold text-gray-900">₹{item.price}</span>
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                                                    {item.bids && item.bids.length > 0 && (
                                                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                                                            <AlertCircle className="h-3 w-3" /> {item.bids.length} Bids
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                                                }`}>
                                                {item.status || "Active"}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                {/* Edit Button - Placeholder for now or link to create if we reuse it */}
                                                <button className="p-2 text-gray-500 hover:text-kh-purple hover:bg-purple-50 rounded-lg transition-colors" title="Edit (Coming Soon)">
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
                            )}

                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
}
