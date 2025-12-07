import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { Check, X, Eye, Package } from 'lucide-react';
import { useUser } from '@/lib/hooks/useUser';
import DashboardSidebar from '@/components/DashboardSidebar';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VerifyPaymentsPage() {
    const { user, loading } = useUser();
    const router = useRouter();

    // New SWR for orders pending delivery (Verified but not Shipped)
    // For simplicity, we might need a new API or filter client-side if the API returns all. 
    // Let's assume we create a new API or just reuse the logic. 
    // Actually, let's update the pending-verification API to return ALL active orders for seller, 
    // and we filter client side for tabs.
    // Ideally, we should have separate APIs, but to save time let's update the API.

    // WAIT: The user said "in their verify payments page clicks delivered". 
    // The current API `pending-verification` ONLY returns `VERIFICATION_PENDING`.
    // I need to update `pending-verification.ts` to also return `VERIFIED` orders that are NOT `DELIVERED`.

    // Let's stick to the plan: Update the API first? 
    // No, let's just make a new API call here for "To Deliver" items.
    // Or better, let's make `pending-verification` return everything relevant.

    const [activeTab, setActiveTab] = useState<'verify' | 'deliver'>('verify');
    const [processing, setProcessing] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectId, setRejectId] = useState<number | null>(null);

    // We need a way to fetch "To Deliver" orders.
    // Let's use a new endpoint or query param.
    const fetcher = (url: string) => fetch(url).then((res) => res.json());

    // Safety check function
    const safeOrders = (data: any) => Array.isArray(data) ? data : [];

    const { data: rawOrders, error: verifyError, mutate } = useSWR(user ? '/api/orders/pending-verification' : null, fetcher);
    const orders = safeOrders(rawOrders);

    const { data: rawDeliveryOrders, error: deliveryError, mutate: mutateDelivery } = useSWR(user ? '/api/orders/pending-delivery' : null, fetcher);
    const deliveryOrders = safeOrders(rawDeliveryOrders);

    if (loading) return <div>Loading...</div>;
    if (!user) {
        router.push('/login');
        return null;
    }

    const handleVerify = async (orderId: number, action: 'APPROVE' | 'REJECT') => {
        if (action === 'REJECT' && !rejectReason) {
            alert("Please provide a reason for rejection");
            return;
        }

        setProcessing(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, reason: rejectReason }),
            });

            if (res.ok) {
                alert(action === 'APPROVE' ? "Payment Verified!" : "Payment Rejected");
                setRejectId(null);
                setRejectReason('');
                mutate();
                mutateDelivery(); // Refresh delivery tab too
            } else {
                const data = await res.json();
                alert(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setProcessing(null);
        }
    };

    const handleDeliver = async (orderId: number) => {
        if (!confirm("Mark this order as Delivered? The buyer will be notified.")) return;
        setProcessing(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}/delivery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'DELIVERED' }),
            });

            if (res.ok) {
                alert("Order marked as Delivered!");
                mutateDelivery();
            } else {
                alert("Failed to update status");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex">
            <Head>
                <title>Manage Orders | Khareed-i</title>
            </Head>

            <DashboardSidebar activeTab="verify-payments" user={user} />

            <main className="flex-1 p-8 overflow-y-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Orders</h1>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('verify')}
                        className={`pb-3 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'verify' ? 'border-kh-purple text-kh-purple' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Verify Payments
                        {orders?.length > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{orders.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('deliver')}
                        className={`pb-3 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'deliver' ? 'border-kh-purple text-kh-purple' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Pending Delivery
                        {deliveryOrders?.length > 0 && <span className="ml-2 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{deliveryOrders.length}</span>}
                    </button>
                </div>

                {activeTab === 'verify' ? (
                    verifyError ? (
                        <div className="bg-red-50 p-8 rounded-xl text-center text-red-500">
                            <h3 className="font-bold">Error loading orders</h3>
                            <p className="text-sm font-mono mt-2">{verifyError.message || JSON.stringify(verifyError)}</p>
                        </div>
                    ) : !orders || orders.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500">
                            <Check className="h-12 w-12 mx-auto text-green-500 mb-3" />
                            <h3 className="font-bold text-gray-900">All Caught Up!</h3>
                            <p>No pending payments to verify.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order: any) => (
                                <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Screenshot */}
                                        <div className="w-full md:w-1/3">
                                            <p className="text-sm font-bold text-gray-700 mb-2">Payment Proof</p>
                                            {order.paymentScreenshot ? (
                                                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-video flex items-center justify-center relative group">
                                                    <img src={order.paymentScreenshot} alt="Proof" className="max-h-full max-w-full object-contain" />
                                                    <a href={order.paymentScreenshot} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold gap-2">
                                                        <Eye className="h-5 w-5" /> View Full
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="rounded-lg overflow-hidden border border-gray-200 bg-yellow-50 aspect-video flex flex-col items-center justify-center p-4 text-center">
                                                    <div className="bg-yellow-100 p-3 rounded-full mb-2">
                                                        <Package className="h-6 w-6 text-yellow-600" />
                                                    </div>
                                                    <p className="font-bold text-yellow-800 text-sm">Cash on Delivery</p>
                                                    <p className="text-xs text-yellow-700 mt-1">Verify payment upon receipt</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">Order #{order.id}</h3>
                                                    <p className="text-sm text-gray-500">Buyer: {order.user?.name || "Unknown"} ({order.user?.email || "No Email"})</p>
                                                    <p className="text-sm text-gray-500">Date: {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'Date Unknown'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-kh-purple">₹{order.amount}</p>
                                                    <p className="text-xs text-gray-500">Total Amount</p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                                <p className="text-sm font-medium text-gray-700">Items:</p>
                                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                                    {order.items?.map((item: any) => (
                                                        <li key={item.id}>{item.listing?.title || item.itemName || "Item Unavailable"} (x{item.quantity})</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {rejectId === order.id ? (
                                                <div className="bg-red-50 p-4 rounded-lg border border-red-100 animate-in fade-in">
                                                    <label className="block text-sm font-bold text-red-800 mb-2">Reason for Rejection</label>
                                                    <textarea
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                        className="w-full p-2 border border-red-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                                        placeholder="e.g. Transaction ID mismatch, blurry image..."
                                                        rows={2}
                                                    />
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => setRejectId(null)}
                                                            className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleVerify(order.id, 'REJECT')}
                                                            disabled={processing === order.id || !rejectReason}
                                                            className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                                        >
                                                            {processing === order.id ? 'Processing...' : 'Confirm Rejection'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-3 mt-4">
                                                    <button
                                                        onClick={() => handleVerify(order.id, 'APPROVE')}
                                                        disabled={processing === order.id}
                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Check className="h-5 w-5" /> Verify Payment
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectId(order.id)}
                                                        disabled={processing === order.id}
                                                        className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <X className="h-5 w-5" /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    // Delivery Tab
                    deliveryError ? (
                        <div className="bg-red-50 p-8 rounded-xl text-center text-red-500">
                            <h3 className="font-bold">Error loading deliveries</h3>
                            <p className="text-sm font-mono mt-2">{deliveryError.message || JSON.stringify(deliveryError)}</p>
                        </div>
                    ) : !deliveryOrders || deliveryOrders.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500">
                            <Package className="h-12 w-12 mx-auto text-orange-500 mb-3" />
                            <h3 className="font-bold text-gray-900">No Pending Deliveries</h3>
                            <p>All verified orders have been shipped!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {deliveryOrders.map((order: any) => (
                                <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">Payment Verified</span>
                                                <span className="text-sm text-gray-500">#{order.trackingId || order.id}</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900">Order #{order.id}</h3>
                                            <p className="text-sm text-gray-500">Buyer: {order.user?.name || "Unknown"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-kh-purple">₹{order.amount}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                        <ul className="text-sm text-gray-600 list-disc list-inside">
                                            {order.items?.map((item: any) => (
                                                <li key={item.id}>{item.listing?.title || item.itemName || "Item Unavailable"} (x{item.quantity})</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => handleDeliver(order.id)}
                                        disabled={processing === order.id}
                                        className="w-full bg-kh-purple hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Package className="h-5 w-5" /> Mark as Delivered
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>
        </div>
    );
}
