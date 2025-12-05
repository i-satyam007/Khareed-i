import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp, Star, X } from 'lucide-react';
import useSWR from 'swr';
import { useUser } from '@/lib/hooks/useUser';
import DashboardSidebar from '@/components/DashboardSidebar';

export default function MyOrdersPage() {
    const { user } = useUser();
    const fetcher = (url: string) => fetch(url).then(res => res.json());
    const { data: orders, mutate } = useSWR(user ? '/api/orders/my-orders' : null, fetcher);

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
                mutate(); // Refresh to potentially show "Reviewed" status if we tracked it
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        }
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

                            {!orders ? (
                                <div className="text-center py-12">Loading orders...</div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                                    <Link href="/" className="text-kh-purple font-bold hover:underline">
                                        Start Shopping
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order: any) => (
                                        <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                            {/* Order Header */}
                                            <div className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer" onClick={() => toggleOrder(order.id)}>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                                                        <Package className="h-6 w-6 text-kh-purple" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">Order #{order.trackingId || order.id}</h3>
                                                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} • ₹{order.totalAmount}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.deliveryStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                        order.deliveryStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {order.deliveryStatus || 'PENDING'}
                                                    </span>
                                                    {expandedOrder === order.id ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            {expandedOrder === order.id && (
                                                <div className="p-4 border-t border-gray-200 bg-white">
                                                    {/* Items List */}
                                                    <div className="space-y-3 mb-6">
                                                        {order.items.map((item: any) => (
                                                            <div key={item.id} className="flex items-center justify-between text-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-gray-100 rounded-md flex-shrink-0">
                                                                        {/* Img placeholder */}
                                                                    </div>
                                                                    <span className="font-medium text-gray-700">{item.listing?.title || "Item Unavailable"}</span>
                                                                </div>
                                                                <span className="text-gray-900">x{item.quantity}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Tracking Progress */}
                                                    <div className="relative pt-6 pb-2 px-4">
                                                        <div className="absolute top-8 left-0 w-full h-1 bg-gray-200 -z-10"></div>
                                                        <div className="flex justify-between text-xs font-bold text-gray-500">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${order.paymentStatus === 'VERIFIED' ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'}`}>
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </div>
                                                                <span>Payment</span>
                                                            </div>
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${order.deliveryStatus === 'SHIPPED' || order.deliveryStatus === 'DELIVERED' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-white'}`}>
                                                                    <Truck className="h-4 w-4" />
                                                                </div>
                                                                <span>Shipped</span>
                                                            </div>
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${order.deliveryStatus === 'DELIVERED' ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'}`}>
                                                                    <Package className="h-4 w-4" />
                                                                </div>
                                                                <span>Delivered</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="mt-6 flex justify-end gap-3">
                                                        {order.deliveryStatus === 'SHIPPED' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeliveryConfirm(order.id); }}
                                                                className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors"
                                                            >
                                                                Mark Received
                                                            </button>
                                                        )}
                                                        {order.deliveryStatus === 'DELIVERED' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openReviewModal(order); }}
                                                                className="px-4 py-2 bg-yellow-500 text-white text-sm font-bold rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
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
                    </main>
                </div>
            </div>

            {/* Review Modal */}
            {reviewModalOpen && (
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
                            How was your experience with "{selectedOrderForReview?.items[0]?.listing?.title || "this item"}"?
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
            )}
        </div>
    );
}
