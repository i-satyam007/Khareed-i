import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp, Star, X, AlertTriangle, MapPin } from 'lucide-react';
import useSWR from 'swr';
import { useUser } from '@/lib/hooks/useUser';
import DashboardSidebar from '@/components/DashboardSidebar';
import Skeleton from '@/components/Skeleton';

export default function MyOrdersPage() {
    const { user } = useUser();
    const fetcher = (url: string) => fetch(url).then(res => res.json());
    const { data: orders, error, mutate } = useSWR(user ? '/api/orders/my-orders' : null, fetcher);

    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedOrderForReview, setSelectedOrderForReview] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const toggleOrder = (id: number) => {
        setExpandedOrder(expandedOrder === id ? null : id);
    };

    const handleDeliveryConfirm = async (orderId: number) => {
        if (!confirm("Confirm that you have received this order?")) return;

        try {
            const res = await fetch(`/api/orders/${orderId}/delivery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'RECEIVED' })
            });

            if (res.ok) {
                mutate();
                alert("Delivery confirmed!");
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to confirm delivery");
        }
    };

    const openReviewModal = (order: any) => {
        setSelectedOrderForReview(order);
        setRating(5);
        setComment('');
        setReviewModalOpen(true);
    };

    const submitReview = async () => {
        if (!selectedOrderForReview) return;

        try {
            const res = await fetch('/api/reviews/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: selectedOrderForReview.id,
                    rating,
                    comment
                })
            });

            if (res.ok) {
                alert('Review submitted successfully!');
                setReviewModalOpen(false);
                mutate();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        }
    };

    const handleReport = (orderId: number) => {
        // Placeholder for report functionality - redirect to report page or open modal
        // For now, simple alert or redirect
        window.location.href = `/report?orderId=${orderId}`;
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head>
                <title>My Orders | Khareed-i</title>
            </Head>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <DashboardSidebar user={user} activeTab="my-orders" />

                    <main className="flex-1">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

                            {!orders && !error ? (
                                <div className="space-y-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white p-4">
                                            <div className="flex flex-col gap-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-4 w-full">
                                                        <Skeleton className="w-16 h-16 rounded-lg" />
                                                        <div className="flex-1 space-y-2">
                                                            <Skeleton className="h-6 w-1/3" />
                                                            <Skeleton className="h-4 w-1/2" />
                                                            <Skeleton className="h-3 w-1/4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : error ? (
                                <div className="text-center py-12 text-red-500">Failed to load orders.</div>
                            ) : !Array.isArray(orders) || orders.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                                    <Link href="/" className="text-kh-purple font-bold hover:underline">
                                        Start Shopping
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order: any) => (
                                        <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-kh-purple transition-all">
                                            {/* Order Header */}
                                            <div className="p-4 flex flex-col gap-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-4">
                                                        {/* Product Image (First item) */}
                                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                                                            {order.items && order.items[0]?.listing?.imagePath ? (
                                                                <img
                                                                    src={order.items[0].listing.imagePath}
                                                                    alt={order.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <Package className="h-8 w-8" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-bold text-gray-900 text-lg">Order #{order.trackingId || order.id}</h3>
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-700 font-medium">{order.title}</p>
                                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                                <Clock className="h-3 w-3" />
                                                                Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date Unknown'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="font-bold text-lg text-gray-900">₹{order.totalAmount}</span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toggleOrder(order.id); }}
                                                            className="text-sm font-bold text-kh-purple hover:underline flex items-center gap-1"
                                                        >
                                                            {expandedOrder === order.id ? 'Hide Tracking' : 'Track Order'}
                                                            {expandedOrder === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Tracking Details */}
                                            {expandedOrder === order.id && (
                                                <div className="bg-gray-50 p-6 border-t border-gray-200 animate-in slide-in-from-top-2">

                                                    <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                        <MapPin className="h-5 w-5 text-kh-purple" />
                                                        Tracking Status
                                                    </h4>

                                                    {/* Progress Bar */}
                                                    <div className="relative mb-12 mx-4">
                                                        <div className="absolute top-[14px] left-0 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>

                                                        {/* Step 1: Payment Made */}
                                                        <div className="flex flex-col items-center gap-2 w-1/3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500 z-10 ${order.paymentStatus !== 'PENDING' || order.status === 'COMPLETED' ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-300'
                                                                }`}>
                                                                <CheckCircle className="h-5 w-5" />
                                                            </div>
                                                            {order.deliveryStatus === 'DELIVERED' ? (
                                                                <Package className="h-5 w-5" />
                                                            ) : (
                                                                <Truck className="h-5 w-5" />
                                                            )}
                                                        </div>
                                                        <span className={`text-xs sm:text-sm font-bold text-center ${order.deliveryStatus === 'DELIVERED' ? 'text-gray-900' : 'text-gray-400'}`}>
                                                            Order Delivered
                                                        </span>
                                                    </div>


                                                    {/* Items List Detail */}
                                                    < div className="bg-white rounded-lg border border-gray-200 p-4 mb-4" >
                                                        <h5 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Items in this Order</h5>
                                                        <div className="space-y-3">
                                                            {order.items.map((item: any) => (
                                                                <div key={item.id} className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                                            {item.listing?.imagePath && (
                                                                                <img src={item.listing.imagePath} alt="" className="w-full h-full object-cover" />
                                                                            )}
                                                                        </div>
                                                                        <span className="font-medium text-gray-800">{item.listing?.title || item.itemName || "Item"}</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="font-bold">₹{item.price}</div>
                                                                        <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                                                        <button
                                                            onClick={() => handleReport(order.id)}
                                                            className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 text-sm"
                                                        >
                                                            <AlertTriangle className="h-4 w-4" />
                                                            Report Issue
                                                        </button>

                                                        {order.deliveryStatus === 'SHIPPED' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeliveryConfirm(order.id); }}
                                                                className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                                Mark Received
                                                            </button>
                                                        )}
                                                        {order.deliveryStatus === 'DELIVERED' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openReviewModal(order); }}
                                                                className="px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2 text-sm"
                                                            >
                                                                <Star className="h-4 w-4 fill-current" />
                                                                Rate & Review
                                                            </button>
                                                        )}
                                                    </div>

                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </main >
                </div >
            </div >

            {/* Review Modal */}
            {
                reviewModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                            <button
                                onClick={() => setReviewModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <h2 className="text-xl font-bold text-gray-900 mb-4">Rate your purchase</h2>
                            <p className="text-sm text-gray-500 mb-6">
                                How was your experience with "{selectedOrderForReview?.items?.[0]?.listing?.title || "this item"}"?
                            </p>

                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`p-2 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                    >
                                        <Star className="h-8 w-8 fill-current" />
                                    </button>
                                ))}
                            </div>

                            <textarea
                                className="w-full border border-gray-300 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-kh-purple focus:border-transparent outline-none resize-none"
                                rows={4}
                                placeholder="Write a review (optional)..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            ></textarea>

                            <button
                                onClick={submitReview}
                                className="w-full bg-kh-purple text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-colors"
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
