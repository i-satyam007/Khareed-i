import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { Check, X, Upload, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function OrderDetailsPage() {
    const router = useRouter();
    const { id } = router.query;
    const [uploading, setUploading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: order, isLoading, mutate, error } = useSWR(id ? `/api/orders/${id}` : null, fetcher);
    const { data: authData } = useSWR("/api/auth/me", fetcher);
    const user = authData?.user;

    React.useEffect(() => {
        if (router.query.alert === 'order_placed') {
            // Use a more prominent notification if available, or standard alert for now
            // Ideally, replace with a toast library
            const timer = setTimeout(() => {
                alert("Order placed successfully! Please coordinate with the seller.");
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [router.query.alert]);

    if (!router.isReady || !id) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (error) {
        console.error("Order fetch error:", error, "ID:", id);
        return <div className="min-h-screen flex items-center justify-center">Error loading order</div>;
    }

    if (!order) {
        return <div className="min-h-screen flex items-center justify-center">Order not found (ID: {id})</div>;
    }

    // Determine if current user is the buyer or the seller
    const isBuyer = user?.id === order.userId;
    // Seller logic: Check if user is the owner of the listing or creator of the group order
    const isSeller = (order.items?.length > 0 && order.items[0].listing?.ownerId === user?.id) ||
        (order.groupOrder && order.groupOrder.creatorId === user?.id);

    // Determine Payment Method (Assuming single item or group order has same method)
    // For now, let's assume if QR code exists on seller, UPI is an option.
    // Ideally, we should store the selected payment method on the Order itself.
    // But based on schema, we added paymentMethods to Listing/GroupOrder.
    // Let's assume if the Listing supports UPI, we show it.

    const listing = order.items?.[0]?.listing;
    const groupOrder = order.groupOrder;
    const seller = listing?.owner || groupOrder?.creator;
    const paymentMethods = listing?.paymentMethods || groupOrder?.paymentMethods || ["CASH"];
    const isUpiAvailable = paymentMethods.includes("UPI") && seller?.qrCode;

    const handleUploadScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setUploading(true);
        const file = e.target.files[0];

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            alert("File size exceeds 10MB limit. Please upload a smaller image.");
            setUploading(false);
            return;
        }

        const reader = new FileReader();

        reader.onloadend = async () => {
            const base64 = reader.result as string;
            try {
                const res = await fetch(`/api/orders/${id}/pay`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ screenshot: base64 }),
                });

                if (res.ok) {
                    alert("Payment screenshot uploaded! Waiting for verification.");
                    mutate();
                } else {
                    alert("Failed to upload screenshot");
                }
            } catch (error) {
                console.error(error);
                alert("An error occurred");
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleVerify = async (action: 'APPROVE' | 'REJECT') => {
        if (action === 'REJECT' && !rejectReason) {
            alert("Please provide a reason for rejection");
            return;
        }

        setVerifying(true);
        try {
            const res = await fetch(`/api/orders/${id}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, reason: rejectReason }),
            });

            if (res.ok) {
                alert(action === 'APPROVE' ? "Payment Verified!" : "Payment Rejected");
                setShowRejectModal(false);
                mutate();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <Head>
                <title>Order #{order.id} | Khareed-i</title>
            </Head>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Status Banner */}
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 border ${order.paymentStatus === 'VERIFIED' ? 'bg-green-50 border-green-200 text-green-800' :
                    order.paymentStatus === 'REJECTED' ? 'bg-red-50 border-red-200 text-red-800' :
                        order.paymentStatus === 'VERIFICATION_PENDING' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                            'bg-blue-50 border-blue-200 text-blue-800'
                    }`}>
                    {order.paymentStatus === 'VERIFIED' ? <Check className="h-6 w-6" /> :
                        order.paymentStatus === 'REJECTED' ? <X className="h-6 w-6" /> :
                            order.paymentStatus === 'VERIFICATION_PENDING' ? <Clock className="h-6 w-6" /> :
                                <AlertTriangle className="h-6 w-6" />}

                    <div>
                        <p className="font-bold">
                            {order.paymentStatus === 'VERIFIED' ? 'Payment Verified' :
                                order.paymentStatus === 'REJECTED' ? 'Payment Rejected' :
                                    order.paymentStatus === 'VERIFICATION_PENDING' ? 'Verification Pending' :
                                        'Payment Pending'}
                        </p>
                        {order.paymentStatus === 'REJECTED' && order.rejectionReason && (
                            <p className="text-sm mt-1">Reason: {order.rejectionReason}</p>
                        )}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                    {order.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                            <div>
                                <p className="font-medium text-gray-900">{item.listing.title}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                        </div>
                    ))}
                    {order.groupOrder && (
                        <div className="py-2">
                            <p className="font-medium text-gray-900">{order.groupOrder.title}</p>
                            <p className="text-sm text-gray-500">Group Order via {order.groupOrder.platform}</p>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
                        <p className="font-bold text-gray-900">Total Amount</p>
                        <p className="text-2xl font-bold text-kh-purple">₹{order.amount}</p>
                    </div>
                </div>

                {/* Payment Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Payment</h2>

                    {/* Buyer View */}
                    {isBuyer && order.paymentStatus !== 'VERIFIED' && (
                        <div className="space-y-6">
                            {isUpiAvailable ? (
                                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 text-center">
                                    <p className="text-sm font-bold text-purple-900 mb-4">Scan to Pay ₹{order.amount}</p>
                                    <div className="bg-white p-2 rounded-lg inline-block shadow-sm mb-4">
                                        <img src={seller.qrCode} alt="Seller QR" className="w-48 h-48 object-contain" />
                                    </div>
                                    <p className="text-xs text-purple-700">Scan using any UPI app (GPay, PhonePe, Paytm)</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-xl text-center text-gray-500">
                                    No UPI QR code available. Please pay cash on delivery.
                                </div>
                            )}

                            {/* Upload Screenshot */}
                            {isUpiAvailable && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Screenshot</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleUploadScreenshot}
                                            disabled={uploading || order.paymentStatus === 'VERIFICATION_PENDING'}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-kh-purple file:text-white hover:file:bg-purple-700 transition-colors cursor-pointer"
                                        />
                                    </div>
                                    {uploading && <p className="text-xs text-kh-purple mt-2">Uploading...</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Seller View */}
                    {isSeller && (
                        <div className="space-y-6">
                            {order.paymentScreenshot ? (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Payment Screenshot</p>
                                    <div className="rounded-xl overflow-hidden border border-gray-200 mb-4">
                                        <img src={order.paymentScreenshot} alt="Payment Proof" className="w-full h-auto" />
                                    </div>

                                    {order.paymentStatus === 'VERIFICATION_PENDING' && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleVerify('APPROVE')}
                                                disabled={verifying}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Check className="h-5 w-5" /> Verify Payment
                                            </button>
                                            <button
                                                onClick={() => setShowRejectModal(true)}
                                                disabled={verifying}
                                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                            >
                                                <X className="h-5 w-5" /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">Buyer hasn't uploaded a screenshot yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Payment</h3>
                        <p className="text-sm text-gray-500 mb-4">Please provide a reason for rejecting this payment. Repeated rejections may penalize the buyer.</p>

                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                            placeholder="e.g. Screenshot is blurry, Transaction ID mismatch..."
                            rows={3}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 py-2.5 text-gray-700 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleVerify('REJECT')}
                                disabled={verifying || !rejectReason}
                                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
