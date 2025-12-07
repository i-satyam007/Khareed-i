import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { User, Package, ShoppingBag, LogOut, Edit2, Trash2, Eye, Clock, Heart, Gavel } from 'lucide-react';
import useSWR from 'swr';
import { useUser } from '@/lib/hooks/useUser';
import DashboardSidebar from '@/components/DashboardSidebar';
import Skeleton from '@/components/Skeleton';

export default function MyListingsPage() {
    const { user } = useUser();
    const fetcher = (url: string) => fetch(url).then(res => res.json());
    const [activeTab, setActiveTab] = React.useState<'listings' | 'group-orders'>('listings');
    const { data: listings, mutate: mutateListings } = useSWR(user && activeTab === 'listings' ? '/api/listings/my-listings' : null, fetcher);
    const { data: groupOrders, mutate: mutateGroupOrders } = useSWR(user && activeTab === 'group-orders' ? '/api/group-orders/my-created' : null, fetcher);

    const handleGDStatusUpdate = async (id: number, status: string) => {
        if (!confirm(`Update status to ${status}? this will notify all participants.`)) return;
        try {
            const res = await fetch(`/api/group-orders/${id}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                alert('Status updated successfully!');
            } else {
                alert('Failed to update status');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this listing?")) {
            try {
                const res = await fetch(`/api/listings/${id}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    mutateListings(); // Refresh list
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

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Skeleton */}
                        <div className="w-full lg:w-64 space-y-4">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <div>
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                                ))}
                            </div>
                        </div>
                        {/* Main Content Skeleton */}
                        <div className="flex-1">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-8 w-48" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-9 w-24 rounded-lg" />
                                        <Skeleton className="h-9 w-32 rounded-lg" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                <h1 className="text-2xl font-bold text-gray-900">My Listings & Group Orders</h1>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActiveTab('listings')}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'listings' ? 'bg-kh-purple text-white shadow-lg shadow-purple-900/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        Listings
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('group-orders')}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'group-orders' ? 'bg-kh-purple text-white shadow-lg shadow-purple-900/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        Group Orders
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'listings' && (
                                <>
                                    <div className="mb-4 flex justify-end">
                                        <Link href="/listings/create" className="text-sm font-bold text-white bg-kh-purple px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                            + New Listing
                                        </Link>
                                    </div>

                                    {!listings ? (
                                        <div className="space-y-4">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                                                    <Skeleton className="w-full sm:w-20 h-20 rounded-lg" />
                                                    <div className="flex-1 w-full space-y-2">
                                                        <Skeleton className="h-5 w-1/3 mx-auto sm:mx-0" />
                                                        <div className="flex justify-center sm:justify-start gap-3">
                                                            <Skeleton className="h-3 w-12" />
                                                            <Skeleton className="h-3 w-12" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
                                                        {item.status.toLowerCase() === 'active' ? (
                                                            <>
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
                                                            </>
                                                        ) : (
                                                            <Link href={`/listings/${item.id}`} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1">
                                                                <Eye className="h-3 w-3" /> View Result
                                                            </Link>
                                                        )}
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'group-orders' && (
                                <>
                                    <div className="mb-4 flex justify-end">
                                        <Link href="/group-orders/create" className="text-sm font-bold text-white bg-kh-purple px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                            + New Group Order
                                        </Link>
                                    </div>

                                    {!groupOrders ? (
                                        <div className="space-y-4">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                                                    <div className="flex justify-between gap-4">
                                                        <div className="w-2/3 space-y-2">
                                                            <Skeleton className="h-6 w-3/4" />
                                                            <div className="flex gap-2">
                                                                <Skeleton className="h-4 w-20" />
                                                                <Skeleton className="h-4 w-20" />
                                                            </div>
                                                        </div>
                                                        <Skeleton className="h-6 w-16" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : groupOrders.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-gray-500 mb-4">You haven't created any group orders yet.</p>
                                            <Link href="/group-orders/create" className="text-kh-purple font-bold hover:underline">
                                                Start a group order
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {groupOrders.map((order: any) => (
                                                <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-kh-purple transition-colors">
                                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                                        <div>
                                                            <Link href={`/group-orders/${order.id}`} className="text-lg font-bold text-gray-900 hover:text-kh-purple transition-colors">
                                                                {order.title}
                                                            </Link>
                                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">{order.platform}</span>
                                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Cutoff: {new Date(order.cutoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {order._count?.participants || 0} Participants</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                                                                {order.status.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Status Controls */}
                                                    {order.status !== 'open' && (
                                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                                            <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Update Delivery Status</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    onClick={() => handleGDStatusUpdate(order.id, 'PLACED')}
                                                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                                                                >
                                                                    Order Placed
                                                                </button>
                                                                <button
                                                                    onClick={() => handleGDStatusUpdate(order.id, 'RECEIVED')}
                                                                    className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                                                                >
                                                                    Received from Partner
                                                                </button>
                                                                <button
                                                                    onClick={() => handleGDStatusUpdate(order.id, 'DELIVERED')}
                                                                    className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                                                                >
                                                                    Delivered to All
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
}
