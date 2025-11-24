import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Trash2, Calendar } from 'lucide-react';

const CATEGORIES = [
    "Electronics",
    "Books",
    "Hostel Essentials",
    "Clothing",
    "Sports Gear",
    "Stationery",
    "Food",
    "Grocery",
    "Other"
];

export default function EditListingPage() {
    const router = useRouter();
    const { id } = router.query;

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: listing, isLoading: listingLoading } = useSWR(id ? `/api/listings/${id}` : null, fetcher);
    const { data: authData } = useSWR("/api/auth/me", fetcher);
    const user = authData?.user;

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm();
    const [otherCategoryMode, setOtherCategoryMode] = useState(false);

    const selectedCategory = watch('category');

    useEffect(() => {
        if (listing) {
            setValue('title', listing.title);
            setValue('description', listing.description);
            setValue('price', listing.price);
            setValue('negotiable', listing.negotiable);

            // Handle Category
            if (CATEGORIES.includes(listing.category)) {
                setValue('category', listing.category);
            } else {
                setValue('category', 'Other');
                setValue('otherCategory', listing.category);
                setOtherCategoryMode(true);
            }

            // Handle Expiry Date
            if (listing.expiryDate) {
                setValue('expiryDate', new Date(listing.expiryDate).toISOString().split('T')[0]);
            }
        }
    }, [listing, setValue]);

    if (listingLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!listing) return <div className="min-h-screen flex items-center justify-center">Listing not found</div>;

    // Redirect if not owner
    if (user && listing.ownerId !== user.id) {
        router.push(`/listings/${id}`);
        return null;
    }

    const onSubmit = async (data: any) => {
        try {
            // Handle "Other" category
            const finalCategory = data.category === 'Other' ? data.otherCategory : data.category;

            const payload = {
                ...data,
                category: finalCategory,
                expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString() : null
            };

            const res = await fetch(`/api/listings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to update listing');

            router.push(`/listings/${id}?alert=updated`);
        } catch (error) {
            console.error(error);
            alert('Failed to update listing');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <Head>
                <title>Edit Listing | Khareed-i</title>
            </Head>

            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Edit Listing</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                            <input
                                {...register('title', { required: true })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-purple"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                            <select
                                {...register("category", { required: "Category is required" })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-purple"
                            >
                                <option value="">Select Category</option>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>

                            {/* Other Category Input */}
                            {selectedCategory === 'Other' && (
                                <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                                    <input
                                        {...register("otherCategory", { required: "Please specify the category" })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-purple text-sm"
                                        placeholder="Specify Category..."
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Expiry Date (Optional)</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    {...register("expiryDate")}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-purple"
                                />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                            <input
                                type="number"
                                {...register('price', { required: true })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-purple"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                            <textarea
                                {...register('description')}
                                rows={5}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-purple"
                            />
                        </div>

                        {!listing.isAuction && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register('negotiable')}
                                    className="w-5 h-5 text-kh-purple rounded focus:ring-kh-purple"
                                />
                                <label className="text-sm font-medium text-gray-700">Open to Negotiation</label>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-kh-purple hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
                    >
                        <Save className="h-5 w-5" />
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}
