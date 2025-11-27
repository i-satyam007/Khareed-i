import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { Clock, Upload, CheckCircle, AlertCircle, ArrowLeft, MessageSquare } from 'lucide-react';

export default function UpiPaymentPage() {
    const router = useRouter();
    const { id } = router.query;
    const [uploading, setUploading] = useState(false);
    const [comment, setComment] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [timerActive, setTimerActive] = useState(true);

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: order, isLoading, error } = useSWR(id ? `/api/orders/${id}` : null, fetcher);

    // Timer Logic
    useEffect(() => {
        if (!timerActive || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timerActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

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
                    body: JSON.stringify({ screenshot: base64, comment }),
                });

                if (res.ok) {
                    setTimerActive(false);
                    router.push(`/orders/${id}?alert=payment_submitted`);
                } else {
                    const data = await res.json();
                    alert(data.message || "Failed to upload screenshot");
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

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error || !order) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;

    // Get QR Code
    const listing = order.items?.[0]?.listing;
    const groupOrder = order.groupOrder;
    const seller = listing?.owner || groupOrder?.creator;
    const qrCode = seller?.qrCode;

    if (!qrCode) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h1 className="text-xl font-bold text-gray-900">QR Code Not Found</h1>
                <p className="text-gray-500 mt-2">The seller has not uploaded a UPI QR code.</p>
                <button onClick={() => router.back()} className="mt-6 text-kh-purple font-bold hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <Head>
                <title>Pay via UPI | Order #{order.id}</title>
            </Head>

            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Complete Payment</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-md">

                {/* Timer Banner */}
                <div className={`mb-6 p-4 rounded-xl flex items-center justify-between ${timeLeft < 60 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <span className="font-bold text-sm">Time Remaining</span>
                    </div>
                    <span className="text-xl font-mono font-bold">{formatTime(timeLeft)}</span>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Amount Header */}
                    <div className="bg-gray-50 p-6 text-center border-b border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Total Amount to Pay</p>
                        <p className="text-3xl font-bold text-gray-900">₹{order.amount}</p>
                    </div>

                    {/* QR Code Section */}
                    <div className="p-8 flex flex-col items-center">
                        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 mb-4">
                            <img src={qrCode} alt="Seller QR" className="w-64 h-64 object-contain" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 text-center">
                            Scan this QR code using any UPI app
                        </p>
                        <div className="flex gap-2 mt-3">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500 font-medium">GPay</span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500 font-medium">PhonePe</span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500 font-medium">Paytm</span>
                        </div>
                    </div>

                    {/* Upload & Comment Section */}
                    <div className="p-6 border-t border-gray-100 space-y-4">

                        {/* Comment Box */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <MessageSquare className="h-4 w-4" /> Add a Note (Optional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="e.g. Paid via GPay (Txn ID: 1234...)"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple outline-none transition-all resize-none text-sm"
                                rows={2}
                            />
                        </div>

                        {/* Upload Button */}
                        <div className="pt-2">
                            <label className={`
                                w-full flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all
                                ${uploading ? 'bg-gray-50 border-gray-300 opacity-50' : 'bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300'}
                            `}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUploadScreenshot}
                                    disabled={uploading}
                                    className="hidden"
                                />
                                {uploading ? (
                                    <span className="text-sm font-bold text-gray-500">Uploading...</span>
                                ) : (
                                    <>
                                        <Upload className="h-6 w-6 text-kh-purple" />
                                        <span className="text-sm font-bold text-kh-purple">Upload Payment Screenshot</span>
                                    </>
                                )}
                            </label>
                            <p className="text-xs text-center text-gray-400 mt-3">
                                Uploading the screenshot will mark the order as paid.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
