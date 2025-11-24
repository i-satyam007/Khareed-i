import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import { ArrowLeft, Gavel, Clock, TrendingUp, AlertCircle } from 'lucide-react';

export default function BidPage() {
    const router = useRouter();
    const { id } = router.query;
    const [bidAmount, setBidAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: listing, isLoading } = useSWR(id ? `/api/listings/${id}` : null, fetcher);
    const { data: authData } = useSWR("/api/auth/me", fetcher);
    const user = authData?.user;

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!listing) return <div className="min-h-screen flex items-center justify-center">Listing not found</div>;
    if (!listing.isAuction) return <div className="min-h-screen flex items-center justify-center">This item is not for auction</div>;

    const currentPrice = listing.price; // This should be the highest bid or start price
    const minBid = currentPrice + 1; // Minimum increment logic

    const handlePlaceBid = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsProcessing(true);

        const amount = Number(bidAmount);
        if (amount < minBid) {
            setError(`Bid must be at least ₹${minBid}`);
            setIsProcessing(false);
            return;
        }

        try {
            const res = await fetch('/api/bids', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId: listing.id, amount }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to place bid');
            }

            setSuccess(true);
            mutate(`/api/listings/${id}`); // Refresh listing data
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4 animate-in zoom-in-95">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-600 mb-4">
                        <Gavel className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Bid Placed!</h1>
                    <p className="text-gray-600">
                        You are now the highest bidder for <strong>{listing.title}</strong> at <strong>₹{bidAmount}</strong>.
                    </p>
                    <button
                        onClick={() => router.back()}
                        className="w-full bg-kh-purple hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors mt-4"
                    >
                        Back to Listing
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <Head>
                <title>Place Bid: {listing.title} | Khareed-i</title>
            </Head>

            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Place a Bid</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-md">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Item Summary */}
                    <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50">
                        <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 shrink-0 overflow-hidden">
                            {listing.imagePath ? (
                                <img src={listing.imagePath} alt={listing.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">📷</div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 line-clamp-1">{listing.title}</h3>
                            <p className="text-xs text-gray-500 mt-1">{listing.category}</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Current Status */}
                        <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <div>
                                <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Current Price</p>
                                <p className="text-2xl font-bold text-purple-900">₹{currentPrice}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Ends In</p>
                                <p className="text-sm font-bold text-purple-900 flex items-center justify-end gap-1">
                                    <Clock className="h-3 w-3" /> 2h 15m
                                </p>
                            </div>
                        </div>

                        {/* Bid Form */}
                        <form onSubmit={handlePlaceBid} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Your Bid Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                                    <input
                                        type="number"
                                        value={bidAmount}
                                        onChange={(e) => setBidAmount(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-kh-purple focus:border-transparent font-bold text-lg"
                                        placeholder={`Min ₹${minBid}`}
                                        min={minBid}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" /> Minimum bid required is ₹{minBid}
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full bg-kh-purple hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-900/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? "Placing Bid..." : "Place Bid"}
                            </button>
                        </form>

                        {/* Recent Bids (Mock for now, would need API support to fetch real bids) */}
                        <div className="pt-6 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-gray-900 mb-3">Recent Bids</h4>
                            <div className="space-y-3">
                                {listing.bids && listing.bids.length > 0 ? (
                                    listing.bids.slice(0, 3).map((bid: any) => (
                                        <div key={bid.id} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                    {bid.bidder?.name?.[0] || 'U'}
                                                </div>
                                                <span className="text-gray-700 font-medium">{bid.bidder?.name || 'User'}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">₹{bid.amount}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No bids yet. Be the first!</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
