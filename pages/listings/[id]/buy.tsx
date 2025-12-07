import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { ShieldCheck, CreditCard, MapPin, ArrowLeft, CheckCircle } from 'lucide-react';

export default function BuyPage() {
    const router = useRouter();
    const { id } = router.query;
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Fetch Listing Data
    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: listing, isLoading } = useSWR(id ? `/api/listings/${id}` : null, fetcher);

    // Fetch User Data
    const { data: authData } = useSWR("/api/auth/me", fetcher);
    const user = authData?.user;

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!listing) return <div className="min-h-screen flex items-center justify-center">Listing not found</div>;

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

    const handleConfirmOrder = async () => {
        if (!selectedPaymentMethod) {
            alert("Please select a payment method");
            return;
        }

        setIsProcessing(true);
        try {
            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId: listing.id, paymentMethod: selectedPaymentMethod }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to place order');
            }

            const newOrder = await res.json();
            console.log("Order created:", newOrder);
            console.log("Selected Payment Method:", selectedPaymentMethod);

            if (selectedPaymentMethod === 'UPI') {
                console.log("Redirecting to Order Details for UPI payment...");
                router.push(`/orders/${newOrder.id}/pay`);
            } else {
                router.push(`/orders/${newOrder.id}?alert=order_placed`);
            }
        } catch (error: any) {
            console.error("Order failed", error);
            alert(error.message || "Failed to place order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4 animate-in zoom-in-95">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Placed!</h1>
                    <p className="text-gray-600">
                        You have successfully purchased <strong>{listing.title}</strong>.
                    </p>
                    <p className="text-sm text-gray-500">
                        The seller has been notified. You can coordinate the pickup in the "Orders" section.
                    </p>
                    <button
                        onClick={() => router.push('/orders')}
                        className="w-full bg-kh-purple hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors mt-4"
                    >
                        View My Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <Head>
                <title>Checkout: {listing.title} | Khareed-i</title>
            </Head>

            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left: Order Details */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Item Card */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
                            <div className="w-24 h-24 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                                {listing.imagePath ? (
                                    <img src={listing.imagePath} alt={listing.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">📷</div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 line-clamp-2">{listing.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{listing.category}</p>
                                <p className="text-lg font-bold text-gray-900 mt-2">₹{listing.price}</p>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-gray-500" /> Pickup Location
                            </h3>
                            <div className="pl-7">
                                <p className="text-sm text-gray-700 font-medium">Seller's Hostel: {listing.owner?.hostel || "Not Provided"}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Meet the seller at a public place (e.g., Common Room, Mess) to inspect the item and collect it.
                                </p>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-gray-500" /> Payment Method
                            </h3>
                            <div className="pl-7 space-y-3">
                                {listing.paymentMethods?.includes('CASH') && (
                                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedPaymentMethod === 'CASH' ? 'border-kh-purple bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="CASH"
                                            checked={selectedPaymentMethod === 'CASH'}
                                            onChange={() => setSelectedPaymentMethod('CASH')}
                                            className="w-4 h-4 text-kh-purple focus:ring-kh-purple"
                                        />
                                        <span className={`text-sm font-bold ${selectedPaymentMethod === 'CASH' ? 'text-purple-900' : 'text-gray-700'}`}>Cash on Delivery</span>
                                    </label>
                                )}
                                {listing.paymentMethods?.includes('UPI') && (
                                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedPaymentMethod === 'UPI' ? 'border-kh-purple bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="UPI"
                                            checked={selectedPaymentMethod === 'UPI'}
                                            onChange={() => setSelectedPaymentMethod('UPI')}
                                            className="w-4 h-4 text-kh-purple focus:ring-kh-purple"
                                        />
                                        <span className={`text-sm font-bold ${selectedPaymentMethod === 'UPI' ? 'text-purple-900' : 'text-gray-700'}`}>UPI / QR Code</span>
                                    </label>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    You will pay the seller directly via the selected method when you meet them.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Price Details</h3>

                            <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Price</span>
                                    <span className="font-medium">₹{listing.price}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Platform Fee</span>
                                    <span className="text-green-600 font-medium">FREE</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <span className="font-bold text-gray-900">Total Amount</span>
                                <span className="text-xl font-bold text-gray-900">₹{listing.price}</span>
                            </div>

                            <button
                                onClick={handleConfirmOrder}
                                disabled={isProcessing}
                                className="w-full bg-kh-red hover:bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-900/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? "Processing..." : "Confirm Order"}
                            </button>

                            <div className="mt-4 flex items-start gap-2 text-[10px] text-gray-500 bg-gray-50 p-2 rounded-lg">
                                <ShieldCheck className="h-3 w-3 shrink-0 mt-0.5" />
                                <p>Safe & Secure. Ensure you inspect the item before paying.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
