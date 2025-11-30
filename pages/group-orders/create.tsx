import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Clock, ShoppingBag, AlertCircle, Upload, X, Check } from 'lucide-react';
import useSWR from 'swr';
import Cropper from 'react-easy-crop';

const PLATFORMS = [
    { id: 'blinkit', name: 'Blinkit', color: 'bg-yellow-400 text-black' },
    { id: 'bigbasket', name: 'BigBasket', color: 'bg-green-600 text-white' },
    { id: 'swiggy', name: 'Swiggy', color: 'bg-orange-500 text-white' },
    { id: 'zomato', name: 'Zomato', color: 'bg-red-500 text-white' },
    { id: 'eatsure', name: 'Eatsure', color: 'bg-purple-600 text-white' },
];

type Point = { x: number, y: number };
type Area = { width: number, height: number, x: number, y: number };

type GroupOrderForm = {
    title: string;
    platform: string;
    cutoffTime: string;
    minOrderValue?: number;
    description?: string;
    paymentMethods: string[];
    qrCode?: string;
    maxParticipants?: number;
    deadline: string;
    imagePath?: string;
};

export default function CreateGroupOrderPage() {
    const router = useRouter();
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<GroupOrderForm>({
        defaultValues: {
            paymentMethods: ['CASH']
        }
    });
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
            router.push("/login?redirect=/group-orders/create");
        }
    }, [authData, authLoading, router]);

    const selectedPlatform = watch("platform");

    // Pre-select platform from URL
    React.useEffect(() => {
        if (router.query.platform) {
            const platformName = router.query.platform as string;
            // Case insensitive match
            const match = PLATFORMS.find(p => p.name.toLowerCase() === platformName.toLowerCase());
            if (match) {
                setValue("platform", match.name);
            }
        }
    }, [router.query.platform, setValue]);

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
            }, 'image/jpeg', 0.7);
        });
    };

    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
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

    const onSubmit = async (data: GroupOrderForm) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/group-orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const newOrder = await res.json();
                router.push(`/group-orders/${newOrder.id}`);
            } else {
                const error = await res.json();
                alert(error.message || 'Failed to create group order');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
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
        <div className="min-h-screen bg-kh-light font-sans text-gray-100">
            <Head>
                <title>Create Group Order | Khareed-i</title>
            </Head>

            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-6 md:p-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Start a Group Order</h1>
                    <p className="text-gray-400 text-sm mb-8">Pool orders with others to save on delivery fees and get bulk discounts.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* Basic Details */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-100 uppercase tracking-wider border-b border-white/10 pb-2">Order Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                                    <input
                                        {...register("title", { required: "Title is required" })}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. Domino's Pizza Group Order"
                                    />
                                    {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Platform / Store</label>
                                    <select
                                        {...register("platform", { required: "Platform is required" })}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all [&>option]:bg-gray-900"
                                    >
                                        <option value="">Select Platform</option>
                                        {PLATFORMS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                    </select>
                                    {errors.platform && <p className="text-red-400 text-xs mt-1">{errors.platform.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Order Deadline</label>
                                    <input
                                        type="datetime-local"
                                        {...register("deadline", { required: "Deadline is required" })}
                                        min={new Date().toISOString().slice(0, 16)}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all [color-scheme:dark]"
                                    />
                                    {errors.deadline && <p className="text-red-400 text-xs mt-1">{errors.deadline.message}</p>}
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Description / Instructions</label>
                                    <textarea
                                        {...register("description", { required: "Description is required" })}
                                        rows={3}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                                        placeholder="e.g. Ordering from the chaotic menu. Meet at H-11 lobby for pickup."
                                    />
                                    {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
                                </div>
                            </div>
                        </section>

                        {/* Limits */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-100 uppercase tracking-wider border-b border-white/10 pb-2">Limits & Split</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Max Participants (Optional)</label>
                                    <input
                                        type="number"
                                        {...register("maxParticipants", { min: 2 })}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        placeholder="No limit"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Image Upload */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-100 uppercase tracking-wider border-b border-white/10 pb-2">Menu / QR Code (Optional)</h2>

                            <div className="relative">
                                {previewImage ? (
                                    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-white/10 group">
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
                                    <label className="block border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-200">
                                            {uploading ? "Uploading..." : "Upload Menu or QR Code"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                                    </label>
                                )}
                            </div>
                        </section>

                        {/* Payment Preferences */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-100 uppercase tracking-wider border-b border-white/10 pb-2">Payment Preferences</h2>

                            <div className="space-y-4">
                                <label className="flex items-center gap-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                                    <input
                                        type="checkbox"
                                        {...register("paymentMethods", { required: "Select at least one payment method" })}
                                        value="CASH"
                                        defaultChecked
                                        className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500 bg-black/20 border-white/10"
                                    />
                                    <div>
                                        <span className="block text-sm font-medium text-gray-200">Cash on Delivery / Pay on Spot</span>
                                        <span className="block text-xs text-gray-400">Participants pay you when they collect items</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                                    <input
                                        type="checkbox"
                                        {...register("paymentMethods")}
                                        value="UPI"
                                        className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500 bg-black/20 border-white/10"
                                    />
                                    <div>
                                        <span className="block text-sm font-medium text-gray-200">UPI / QR Code</span>
                                        <span className="block text-xs text-gray-400">Participants pay online via UPI</span>
                                    </div>
                                </label>
                                {errors.paymentMethods && <p className="text-red-400 text-xs mt-1">{errors.paymentMethods.message}</p>}

                                {watch("paymentMethods")?.includes("UPI") && (
                                    <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-purple-900/10 rounded-xl border border-purple-500/20">
                                        <label className="block text-sm font-medium text-purple-200 mb-2">Upload UPI QR Code <span className="text-red-400">*</span></label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                if (e.target.files?.[0]) {
                                                    try {
                                                        const compressedBase64 = await resizeImage(e.target.files[0]);
                                                        setValue('qrCode', compressedBase64, { shouldValidate: true });
                                                    } catch (error) {
                                                        console.error("Error compressing image", error);
                                                        alert("Failed to process QR code image");
                                                    }
                                                }
                                            }}
                                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30"
                                        />
                                        <input
                                            type="hidden"
                                            {...register("qrCode", {
                                                validate: (value) => {
                                                    const methods = watch("paymentMethods");
                                                    if (methods?.includes("UPI") && !value) {
                                                        return "QR Code is required for UPI payments";
                                                    }
                                                    return true;
                                                }
                                            })}
                                        />
                                        {errors.qrCode && <p className="text-red-400 text-xs mt-1">{errors.qrCode.message}</p>}
                                        <p className="text-xs text-gray-500 mt-2">
                                            Upload a screenshot of your UPI QR code. This will be shown to participants when they join.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Submit */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || uploading}
                                className="w-full bg-kh-purple hover:bg-purple-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-900/20 transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Creating Group Order..." : "Start Group Order"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* Cropper Modal */}
            {cropImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="bg-gray-900 rounded-2xl overflow-hidden w-full max-w-lg flex flex-col max-h-[90vh] border border-white/10">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-white">Crop Image</h3>
                            <button onClick={() => setCropImage(null)} className="text-gray-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="relative h-64 sm:h-80 bg-black">
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
                                <label className="text-xs font-medium text-gray-400 mb-1 block">Zoom</label>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCropImage(null)}
                                    className="flex-1 py-2.5 text-gray-300 font-bold border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUploadCroppedImage}
                                    disabled={uploading}
                                    className="flex-1 py-2.5 bg-kh-purple text-white font-bold rounded-xl hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
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
