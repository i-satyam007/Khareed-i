import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useSWR from 'swr';
import OfferModal from '../../components/OfferModal';

import { Heart, Share2, MapPin, ShieldCheck, Clock, User, Gavel, Check, X, MessageCircle, Shield } from 'lucide-react';



export default function ProductDetailsPage() {
    const router = useRouter();
    const { id } = router.query;
    const [activeImage, setActiveImage] = useState(0);

    // Fetch Listing Data
    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: listing, isLoading: listingLoading, error: listingError, mutate } = useSWR(id ? `/api/listings/${id}` : null, fetcher);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

    const { data: authData } = useSWR("/api/auth/me", fetcher);
    const user = authData?.user;
    const isOwner = user?.id === listing?.ownerId;

    const { data: myOffer } = useSWR(user && !isOwner && listing ? `/api/listings/${id}/my-offer` : null, fetcher);

    const handleMakeOffer = async (amount: number) => {
        try {
            const res = await fetch('/api/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId: listing.id, amount }),
            });
            if (res.ok) {
                alert('Offer sent successfully!');
                setIsOfferModalOpen(false);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to send offer');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        }
    };

    const handleOfferAction = async (offerId: number, status: 'ACCEPTED' | 'REJECTED') => {
        try {
            const res = await fetch(`/api/offers/${offerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                alert(`Offer ${status.toLowerCase()}!`);
                mutate();
            } else {
                alert('Failed to update offer');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        }
    };

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

    const handleConfirmOrder = async () => {
        // Allow if myOffer exists OR if it's an auction win
        const isAuctionEnded = listing.isAuction && listing.auctionTo && new Date(listing.auctionTo) < new Date();
        const highestBid = listing.bids && listing.bids[0];
        // Check username match as fallback if IDs are tricky, but IDs are safer. 
        // Assuming user.username is available.
        const isWinner = isAuctionEnded && highestBid && user && (highestBid.bidder?.username === user.username);

        if (!myOffer && !isWinner) return;

        if (!selectedPaymentMethod) {
            alert("Please select a payment method");
            return;
        }

        try {
            const payload: any = { listingId: listing.id, paymentMethod: selectedPaymentMethod };
            if (myOffer) {
                payload.offerId = myOffer.id;
            }

            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                const newOrder = await res.json();
                if (selectedPaymentMethod === 'UPI') {
                    router.push(`/orders/${newOrder.id}/pay`);
                } else {
                    router.push(`/orders/${newOrder.id}?alert=order_placed`);
                }
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to create order');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        }
    };



    if (listingLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (listingError || !listing) return <div className="min-h-screen flex items-center justify-center">Listing not found</div>;

    const discount = Math.round(((listing.mrp - listing.price) / listing.mrp) * 100);
    const images = listing.imagePath ? [listing.imagePath] : []; // Handle single image for now, extendable to array

    const handleShare = async () => {
        const shareData = {
            title: listing.title,
            text: `Check out this ${listing.title} on Khareed-i!`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy:', err);
                alert('Failed to copy link');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head>
                <title>{listing.title} | Khareed-i</title>
            </Head>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                    {/* Left: Images */}
                    <div className="space-y-4">
                        <div className="aspect-[4/3] bg-white rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center relative group">
                            {images.length > 0 ? (
                                <a href={images[activeImage]} target="_blank" rel="noopener noreferrer" className="cursor-zoom-in w-full h-full">
                                    <img
                                        src={images[activeImage]}
                                        alt={listing.title}
                                        className="w-full h-full object-cover"
                                    />
                                </a>
                            ) : (
                                <div className="text-gray-300 flex flex-col items-center">
                                    <span className="text-6xl">📷</span>
                                    <span className="text-sm mt-2">No Image Available</span>
                                </div>
                            )}

                            <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full text-gray-500 hover:text-red-500 transition-colors shadow-sm">
                                <Heart className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {images.map((img: string, i: number) => (
                                    <div
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`w-20 h-20 bg-white rounded-lg border shrink-0 cursor-pointer transition-colors overflow-hidden ${activeImage === i ? 'border-kh-purple ring-2 ring-kh-purple/20' : 'border-gray-200 hover:border-kh-purple'}`}
                                    >
                                        <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div className="flex flex-col">

                        {/* Breadcrumb */}
                        <div className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                            <span>Home</span> / <span>Listings</span> / <span className="text-gray-900 font-medium">{listing.category}</span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">₹{listing.price}</span>
                                <span className="text-lg text-gray-400 line-through">₹{listing.mrp}</span>
                            </div>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">{discount}% OFF</span>
                            {listing.negotiable && (
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md border border-blue-100">Negotiable</span>
                            )}
                            {listing.isAuction && (
                                <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-1 rounded-md border border-purple-100">Auction</span>
                            )}
                        </div>
                        {listing.isAuction && listing.bids && listing.bids.length > 0 && (
                            <div className="mb-6 -mt-4 text-sm text-gray-600 flex items-center gap-2 bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <Gavel className="h-4 w-4 text-purple-600" />
                                <span>
                                    Highest Bid by <span className="font-bold text-gray-900">{listing.bids[0].bidder?.name || listing.bids[0].bidder?.username || 'User'}</span>
                                </span>
                            </div>
                        )}

                        {/* Auction Winner View */}
                        {listing.isAuction && listing.auctionTo && new Date(listing.auctionTo) < new Date() && listing.bids && listing.bids[0] && user && listing.bids[0].bidder?.username === user.username && (
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 mb-6 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <Gavel className="h-5 w-5 text-purple-600 mt-0.5" />
                                    <div className="w-full">
                                        <p className="text-purple-800 font-bold mb-1">You Won This Auction!</p>
                                        <p className="text-purple-700 text-sm mb-3">
                                            Congratulations! You had the highest bid of <strong>₹{listing.bids[0].amount}</strong>.
                                        </p>

                                        {/* Payment Method Selection */}
                                        <div className="mb-4">
                                            <p className="text-xs font-bold text-purple-800 mb-2 uppercase">Select Payment Method</p>
                                            <div className="flex gap-2">
                                                {listing.paymentMethods?.includes('CASH') && (
                                                    <button
                                                        onClick={() => setSelectedPaymentMethod('CASH')}
                                                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${selectedPaymentMethod === 'CASH' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-purple-200 hover:border-purple-400'}`}
                                                    >
                                                        Cash on Delivery
                                                    </button>
                                                )}
                                                {listing.paymentMethods?.includes('UPI') && (
                                                    <button
                                                        onClick={() => setSelectedPaymentMethod('UPI')}
                                                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${selectedPaymentMethod === 'UPI' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-purple-200 hover:border-purple-400'}`}
                                                    >
                                                        UPI / QR Code
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleConfirmOrder}
                                            disabled={!selectedPaymentMethod}
                                            className="w-full bg-purple-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Claim & Pay
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bidder View: Accepted Offer */}
                        {myOffer && myOffer.status === 'ACCEPTED' && (
                            <div className="bg-green-50 p-4 rounded-xl border border-green-200 mb-6 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                                    <div className="w-full">
                                        <p className="text-green-800 font-bold mb-1">Offer Accepted!</p>
                                        <p className="text-green-700 text-sm mb-3">
                                            The seller accepted your offer of <strong>₹{myOffer.amount}</strong>.
                                        </p>

                                        {/* Payment Method Selection */}
                                        <div className="mb-4">
                                            <p className="text-xs font-bold text-green-800 mb-2 uppercase">Select Payment Method</p>
                                            <div className="flex gap-2">
                                                {listing.paymentMethods?.includes('CASH') && (
                                                    <button
                                                        onClick={() => setSelectedPaymentMethod('CASH')}
                                                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${selectedPaymentMethod === 'CASH' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-green-200 hover:border-green-400'}`}
                                                    >
                                                        Cash on Delivery
                                                    </button>
                                                )}
                                                {listing.paymentMethods?.includes('UPI') && (
                                                    <button
                                                        onClick={() => setSelectedPaymentMethod('UPI')}
                                                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${selectedPaymentMethod === 'UPI' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-green-200 hover:border-green-400'}`}
                                                    >
                                                        UPI / QR Code
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleConfirmOrder}
                                            disabled={!selectedPaymentMethod}
                                            className="w-full bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Confirm Order & Pay
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Seller Info Card */}
                        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-kh-purple/10 rounded-full flex items-center justify-center text-kh-purple font-bold overflow-hidden">
                                    {listing.owner?.avatar ? (
                                        <img src={listing.owner.avatar} alt={listing.owner.name} className="w-full h-full object-cover" />
                                    ) : (
                                        listing.owner?.name ? listing.owner.name[0].toUpperCase() : <User className="h-5 w-5" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{listing.owner?.name || listing.owner?.username || "Unknown Seller"}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {listing.owner?.hostel || "Hostel"}
                                    </p>
                                </div>
                            </div>
                            <Link href={`/users/${listing.owner?.id}`} className="text-xs font-medium text-kh-purple border border-kh-purple px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                                View Profile
                            </Link>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Description</h3>
                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                {listing.description}
                            </p>
                        </div>

                        {/* Reviews Section (Only for Sold items) */}
                        {listing.status === 'sold' && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Reviews</h3>
                                <div className="space-y-4">
                                    {listing.reviews && listing.reviews.length > 0 ? (
                                        listing.reviews.map((review: any) => (
                                            <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                            {review.user?.avatar ? <img src={review.user.avatar} className="w-full h-full rounded-full object-cover" /> : review.user?.name?.[0]}
                                                        </div>
                                                        <span className="font-bold text-sm text-gray-900">{review.user?.name || 'User'}</span>
                                                    </div>
                                                    <div className="flex text-yellow-400 text-xs">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-sm">{review.comment}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-gray-500 text-sm italic">No reviews yet.</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Owner View: Bid History */}
                        {isOwner && listing.isAuction && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Bid History</h3>
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    {listing.bids && listing.bids.length > 0 ? (
                                        <div className="divide-y divide-gray-100">
                                            {listing.bids.map((bid: any) => (
                                                <div key={bid.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs overflow-hidden">
                                                            {bid.bidder?.avatar ? (
                                                                <img src={bid.bidder.avatar} alt={bid.bidder.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                bid.bidder?.name?.[0] || 'U'
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{bid.bidder?.name || bid.bidder?.username || 'User'}</p>
                                                            <p className="text-xs text-gray-500">{new Date(bid.createdAt).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-gray-900">₹{bid.amount}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 text-sm">
                                            No bids yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Owner View: Offers */}
                        {isOwner && listing.negotiable && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Offers</h3>
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    {listing.offers && listing.offers.length > 0 ? (
                                        <div className="divide-y divide-gray-100">
                                            {listing.offers.map((offer: any) => (
                                                <div key={offer.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs overflow-hidden">
                                                            {offer.bidder?.avatar ? (
                                                                <img src={offer.bidder.avatar} alt={offer.bidder.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                offer.bidder?.name?.[0] || 'U'
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{offer.bidder?.name || offer.bidder?.username || 'User'}</p>
                                                            <p className="text-xs text-gray-500">{new Date(offer.createdAt).toLocaleString()}</p>
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                                                offer.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {offer.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-gray-900">₹{offer.amount}</span>
                                                        {offer.status === 'PENDING' && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleOfferAction(offer.id, 'ACCEPTED')}
                                                                    className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100"
                                                                    title="Accept"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleOfferAction(offer.id, 'REJECTED')}
                                                                    className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                                                    title="Reject"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 text-sm">
                                            No offers yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions - Self-Buy Prevention */}
                        <div className="mt-auto space-y-3">
                            {isOwner ? (
                                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
                                    <p className="text-yellow-800 font-bold text-sm mb-2">This is your listing</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => router.push(`/listings/${id}/edit`)}
                                            className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Edit Listing
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (confirm("Are you sure you want to delete this listing?")) {
                                                    try {
                                                        const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
                                                        if (res.ok) {
                                                            router.push('/?alert=deleted');
                                                        } else {
                                                            alert("Failed to delete listing");
                                                        }
                                                    } catch (error) {
                                                        console.error(error);
                                                        alert("An error occurred");
                                                    }
                                                }
                                            }}
                                            className="flex-1 bg-red-50 border border-red-100 text-red-600 font-bold py-2.5 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => router.push(listing.isAuction ? `/listings/${id}/bid` : `/listings/${id}/buy`)}
                                        className="flex-1 bg-kh-red hover:bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-900/20 transition-all transform active:scale-[0.98]"
                                    >
                                        {listing.isAuction ? "Place Bid" : "Buy Now"}
                                    </button>

                                    {listing.negotiable && !listing.isAuction && (
                                        <button
                                            onClick={() => setIsOfferModalOpen(true)}
                                            className="flex-1 bg-white border-2 border-gray-200 hover:border-kh-purple text-gray-700 font-bold py-3.5 rounded-xl transition-all"
                                        >
                                            Make an Offer
                                        </button>
                                    )}

                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('open-chat', { detail: { userId: listing.ownerId } }))}
                                        className="px-4 bg-white border-2 border-gray-200 hover:border-kh-purple text-gray-700 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center"
                                        title="Chat with Seller"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                    </button>
                                </div>
                            )}

                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleShare}
                                className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 py-2"
                            >
                                <Share2 className="h-4 w-4" /> Share this listing
                            </button>
                            <button
                                onClick={() => alert("Reported to Admin for review.")}
                                className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-red-500 hover:text-red-700 py-2"
                            >
                                <Shield className="h-4 w-4" /> Report
                            </button>
                        </div>

                        {/* Safety Tip */}
                        <div className="mt-6 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-3">
                            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-blue-800">Safety Tip</p>
                                <p className="text-[11px] text-blue-600 mt-0.5">
                                    Always inspect the item in person before making the final payment. Meet in public areas like the Common Room or Mess.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>


            <OfferModal
                isOpen={isOfferModalOpen}
                onClose={() => setIsOfferModalOpen(false)}
                onSubmit={handleMakeOffer}
                listingTitle={listing.title}
                price={listing.price}
            />
        </div >
    );
}
