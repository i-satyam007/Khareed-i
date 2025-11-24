import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Trash2, Calendar, Upload, X } from 'lucide-react';

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
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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

            // Handle Image
            if (listing.imagePath) {
                setValue('imagePath', listing.imagePath);
                setPreviewImage(listing.imagePath);
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setValue('imagePath', data.url);
            setPreviewImage(data.url);
        } catch (error) {
            console.error(error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setValue('imagePath', null);
        setPreviewImage(null);
    };

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
                                {/* Removed custom Calendar icon */}
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

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Photo</label>
                            <div className="relative">
                                {previewImage ? (
                                    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-200 group">
                                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="h-6 w-6 text-gray-500" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {uploading ? "Uploading..." : "Click to upload photos"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                                    </label>
                                )}
                            </div>
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
                        disabled={isSubmitting || uploading}
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
