import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { Upload, DollarSign, Clock, AlertCircle, Calendar, X, Check } from 'lucide-react';
import Cropper from 'react-easy-crop';
// import { Point, Area } from 'react-easy-crop/types';
type Point = { x: number, y: number };
type Area = { width: number, height: number, x: number, y: number };

type ListingForm = {
    title: string;
    description: string;
    category: string;
    otherCategory?: string;
    mrp: number;
    price: number;
    negotiable: boolean;
    isAuction: boolean;
    auctionStartPrice?: number;
    auctionDuration?: number;
    allowNegativeBids: boolean;
    minBidAmount?: number;
    expiryDate?: string;
    imagePath?: string;
    autoSell: boolean;
};

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

export default function CreateListingPage() {
    const router = useRouter();
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ListingForm>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Cropper State
    const [cropImage, setCropImage] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

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
    const selectedCategory = watch("category");

    // Calculate base price for negative bid limit
    const basePrice = isAuction ? auctionStartPrice : sellingPrice;

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => setCropImage(reader.result as string));
            reader.readAsDataURL(file);
        }
    };

    const handleUploadCroppedImage = async () => {
        if (!cropImage || !croppedAreaPixels) return;

        try {
            setUploading(true);
            const croppedBlob = await getCroppedImg(cropImage, croppedAreaPixels);

            // Convert Blob to Base64
            const reader = new FileReader();
            reader.readAsDataURL(croppedBlob);
            reader.onloadend = () => {
                const base64data = reader.result as string;
                setValue('imagePath', base64data);
                setPreviewImage(base64data);
                setCropImage(null); // Close cropper
                setUploading(false);
            };
        } catch (error) {
            console.error(error);
            alert('Failed to process image');
            setUploading(false);
        }
    };

    const removeImage = () => {
        setValue('imagePath', undefined);
        setPreviewImage(null);
    };

    const onSubmit = async (data: ListingForm) => {
        setIsSubmitting(true);
        try {
            // Handle "Other" category
            const finalCategory = data.category === 'Other' ? data.otherCategory : data.category;

            const payload = {
                ...data,
                category: finalCategory,
                // Ensure expiryDate is properly formatted or null if empty
                expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString() : null
            };

            const res = await fetch('/api/listings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
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

                                    {/* Other Category Input */}
                                    {selectedCategory === 'Other' && (
                                        <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                                            <input
                                                {...register("otherCategory", { required: "Please specify the category" })}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple outline-none transition-all text-sm"
                                                placeholder="Specify Category..."
                                            />
                                            {errors.otherCategory && <p className="text-red-500 text-xs mt-1">{errors.otherCategory.message}</p>}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            {...register("expiryDate")}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple outline-none transition-all"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Useful for food, coupons, or time-sensitive items.</p>
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
                                <div className="pt-2 space-y-3">
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

                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input type="checkbox" {...register("autoSell")} className="w-4 h-4 text-kh-purple rounded focus:ring-kh-purple" defaultChecked />
                                        <div>
                                            <span className="block text-sm font-medium text-gray-900">Auto-Sell to Highest Bidder</span>
                                            <span className="block text-xs text-gray-500">Automatically accept the highest bid when auction ends</span>
                                        </div>
                                    </label>
                                </div>
                            )}
                        </section>

                        {/* Image Upload */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Photos</h2>

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
                                            onChange={handleFileSelect}
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
                        </section>

                        {/* Submit */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || uploading}
                                className="w-full bg-kh-red hover:bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-900/20 transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Creating Listing..." : "Post Listing"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* Cropper Modal */}
            {cropImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-white rounded-2xl overflow-hidden w-full max-w-lg flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Crop Image</h3>
                            <button onClick={() => setCropImage(null)} className="text-gray-500 hover:text-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="relative h-64 sm:h-80 bg-gray-900">
                            <Cropper
                                image={cropImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={4 / 3}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Zoom</label>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCropImage(null)}
                                    className="flex-1 py-2.5 text-gray-700 font-bold border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUploadCroppedImage}
                                    disabled={uploading}
                                    className="flex-1 py-2.5 bg-kh-purple text-white font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {uploading ? "Uploading..." : (
                                        <>
                                            <Check className="h-4 w-4" /> Crop & Upload
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
