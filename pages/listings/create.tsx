import React, { useState } from 'react';
import Head from 'next/head';

import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { Upload, DollarSign, Clock, AlertCircle } from 'lucide-react';

type ListingForm = {
    title: string;
    description: string;
    category: string;
    mrp: number;
    price: number;
    negotiable: boolean;
    isAuction: boolean;
    auctionStartPrice?: number;
    auctionDuration?: number;
    allowNegativeBids: boolean;
    minBidAmount?: number;
};

const CATEGORIES = ["Electronics", "Books", "Hostel Essentials", "Clothing", "Sports Gear", "Stationery"];

export default function CreateListingPage() {
    const router = useRouter();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<ListingForm>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auth Check
    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: authData, isLoading: authLoading } = useSWR("/api/auth/me", fetcher);

    React.useEffect(() => {
        if (!authLoading && !authData?.user) {
            router.push("/login?redirect=/listings/create");
        }
    }, [authData, authLoading, router]);

    const isAuction = watch("isAuction");
    const allowNegativeBids = watch("allowNegativeBids");
    const sellingPrice = watch("price");
    const auctionStartPrice = watch("auctionStartPrice");

    // Calculate base price for negative bid limit
    const basePrice = isAuction ? auctionStartPrice : sellingPrice;

    const onSubmit = async (data: ListingForm) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/listings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to create listing');
            }

            // Redirect with alert param
            const responseData = await res.json();
            router.push(`/listings/${responseData.id}?alert=created`);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Error creating listing");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!authData?.user) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head>
                <title>List an Item | Khareed-i</title>
            </Head>

            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">List an Item</h1>
                    <p className="text-gray-500 text-sm mb-8">Fill in the details to sell your product on Khareed-i.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* Basic Details */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Basic Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                                    <input
                                        {...register("title", { required: "Title is required" })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple outline-none transition-all"
                                        placeholder="e.g. Scientific Calculator FX-991ES"
                                    />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        {...register("category", { required: "Category is required" })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple outline-none transition-all"
                                    >
                                        <option value="">Select Category</option>
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        {...register("description", { required: "Description is required" })}
                                        rows={4}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple outline-none transition-all resize-none"
                                        placeholder="Describe the condition, age, and features..."
                                    />
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                                </div>
                            </div>
                        </section>

                        {/* Pricing & Negotiation */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Pricing & Strategy</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹)</label>
                                    <input
                                        type="number"
                                        {...register("mrp", { required: "MRP is required", min: 0 })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple outline-none transition-all"
                                        placeholder="Original Price"
                                    />
                                </div>

                                {!isAuction && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label>
                                        <input
                                            type="number"
                                            {...register("price", { required: !isAuction ? "Selling Price is required" : false, min: 0 })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple outline-none transition-all"
                                            placeholder="Your Price"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                {!isAuction && (
                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input type="checkbox" {...register("negotiable")} className="w-4 h-4 text-kh-purple rounded focus:ring-kh-purple" />
                                        <div>
                                            <span className="block text-sm font-medium text-gray-900">Open to Negotiation</span>
                                            <span className="block text-xs text-gray-500">Allow buyers to chat and negotiate price</span>
                                        </div>
                                    </label>
                                )}

                                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input type="checkbox" {...register("isAuction")} className="w-4 h-4 text-kh-purple rounded focus:ring-kh-purple" />
                                    <div>
                                        <span className="block text-sm font-medium text-gray-900">List as Auction</span>
                                        <span className="block text-xs text-gray-500">Let buyers bid on your item</span>
                                    </div>
                                </label>
                            </div>

                            {/* Negotiation Warning */}
                            {!isAuction && watch("negotiable") && sellingPrice && (
                                <div className="mt-2 flex items-start gap-2 text-xs text-blue-700 bg-blue-50 p-3 rounded-md border border-blue-100 animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <p>
                                        System Rule: Negotiation offers cannot go below <strong>₹{Math.round(sellingPrice * 0.6)}</strong> (60% of Selling Price).
                                    </p>
                                </div>
                            )}

                            {/* Auction Settings */}
                            {isAuction && (
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-2 text-purple-800 text-sm font-bold mb-2">
                                        <Clock className="h-4 w-4" /> Auction Settings
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-purple-900 mb-1">Start Price (₹)</label>
                                            <input
                                                type="number"
                                                {...register("auctionStartPrice", { required: isAuction ? "Start Price is required" : false, min: 0 })}
                                                className="w-full px-3 py-2 bg-white border border-purple-200 rounded-md text-sm focus:outline-none focus:border-purple-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-purple-900 mb-1">Duration (Hours)</label>
                                            <input
                                                type="number"
                                                {...register("auctionDuration", { required: isAuction ? "Duration is required" : false, min: 1 })}
                                                className="w-full px-3 py-2 bg-white border border-purple-200 rounded-md text-sm focus:outline-none focus:border-purple-400"
                                                placeholder="e.g. 24"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Negative Bids Logic - Only for Auctions */}
                            {isAuction && (
                                <div className="pt-2">
                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input type="checkbox" {...register("allowNegativeBids")} className="w-4 h-4 text-kh-purple rounded focus:ring-kh-purple" />
                                        <div>
                                            <span className="block text-sm font-medium text-gray-900">Allow Negative Bids</span>
                                            <span className="block text-xs text-gray-500">Allow bids lower than selling price (Max 60% limit applies)</span>
                                        </div>
                                    </label>

                                    {allowNegativeBids && basePrice && (
                                        <div className="mt-2 flex items-start gap-2 text-xs text-orange-700 bg-orange-50 p-3 rounded-md border border-orange-100">
                                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                            <p>
                                                System Rule: Bids cannot go below <strong>₹{Math.round(basePrice * 0.6)}</strong> (60% of Start Price).
                                                This protects you from low-ball offers.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Image Upload */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Photos</h2>

                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className="h-6 w-6 text-gray-500" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">Click to upload photos</p>
                                <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 3MB)</p>
                            </div>
                        </section>

                        {/* Submit */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-kh-red hover:bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-900/20 transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Creating Listing..." : "Post Listing"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
