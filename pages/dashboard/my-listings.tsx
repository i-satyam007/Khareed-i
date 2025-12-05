import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { User, Package, ShoppingBag, LogOut, Edit2, Trash2, Eye, Clock, Heart, Gavel } from 'lucide-react';
import useSWR from 'swr';
import { useUser } from '@/lib/hooks/useUser';
import DashboardSidebar from '@/components/DashboardSidebar';

export default function MyListingsPage() {
    const { user } = useUser();
    const fetcher = (url: string) => fetch(url).then(res => res.json());
    const { data: listings, mutate, error } = useSWR(user ? '/api/listings/my-listings' : null, fetcher);

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this listing?")) {
            try {
                const res = await fetch(`/api/listings/${id}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    mutate(); // Refresh list
                    (window as any).showToast?.('Listing deleted successfully', 'success');
                } else {
                    const data = await res.json();
                    alert(data.message || 'Failed to delete listing');
                }
            } catch (err) {
                console.error(err);
                alert('An error occurred');
            }
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head>
                <title>My Listings | Khareed-i</title>
            </Head>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Navigation */}
                    <DashboardSidebar user={user} activeTab="my-listings" />

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                                <Link href="/listings/create" className="text-sm font-bold text-white bg-kh-purple px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                    + New Listing
                                </Link>
                            </div>

                            {!listings ? (
                                <div className="text-center py-12">Loading listings...</div>
                            ) : listings.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 mb-4">You haven't listed anything yet.</p>
                                    <Link href="/listings/create" className="text-kh-purple font-bold hover:underline">
                                        Create your first listing
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {listings.map((item: any) => (
                                        <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-300 transition-all bg-gray-50/50">

                                            {/* Image Placeholder */}
                                            <div className="w-full sm:w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Package className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 text-center sm:text-left">
                                                <Link href={`/listings/${item.id}`} className="font-bold text-gray-900 hover:text-kh-purple transition-colors block">
                                                    {item.title}
                                                </Link>
                                                <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-gray-500 mt-1">
                                                    <span className="font-bold text-gray-900">₹{item.price}</span>
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.posted}</span>
                                                    {item.bidsCount > 0 && (
                                                        <span className="flex items-center gap-1 text-kh-purple font-bold"><Gavel className="h-3 w-3" /> {item.bidsCount} Bids</span>
                                                    )}
                                                    {item.likesCount > 0 && (
                                                        <span className="flex items-center gap-1 text-red-500"><Heart className="h-3 w-3 fill-current" /> {item.likesCount}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === "Active" ? "bg-green-100 text-green-700" :
                                                item.status === "Sold" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
                                                }`}>
                                                {item.status}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <Link href={`/listings/${item.id}/edit`} className="p-2 text-gray-500 hover:text-kh-purple hover:bg-purple-50 rounded-lg transition-colors" title="Edit">
                                                    <Edit2 className="h-4 w-4" />
                                                </Link>
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
