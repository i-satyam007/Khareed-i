import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Clock, ShoppingBag, AlertCircle } from 'lucide-react';

const PLATFORMS = [
    { id: 'blinkit', name: 'Blinkit', color: 'bg-yellow-400 text-black' },
    { id: 'bigbasket', name: 'BigBasket', color: 'bg-green-600 text-white' },
    { id: 'swiggy', name: 'Swiggy', color: 'bg-orange-500 text-white' },
    { id: 'zomato', name: 'Zomato', color: 'bg-red-500 text-white' },
    { id: 'eatsure', name: 'Eatsure', color: 'bg-purple-600 text-white' },
];

type GroupOrderForm = {
    title: string;
    platform: string;
    cutoffTime: string;
    minOrderValue?: number;
    description?: string;
};

export default function CreateGroupOrderPage() {
    const router = useRouter();
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<GroupOrderForm>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedPlatform = watch("platform");

    const onSubmit = async (data: GroupOrderForm) => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log(data);
        // Redirect to the new group order page (mock ID 99)
        router.push('/group-orders/99');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head>
                <title>Start Group Order | Khareed-i</title>
            </Head>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-kh-purple/10 rounded-full">
                            <ShoppingBag className="h-6 w-6 text-kh-purple" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Start a Group Order</h1>
                            <p className="text-gray-500 text-sm">Pool orders to save on delivery fees.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* Platform Selection */}
                        <section>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Select Platform</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {PLATFORMS.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setValue("platform", p.name)}
                                        className={`
                      p-3 rounded-xl border-2 text-sm font-bold transition-all
                      ${selectedPlatform === p.name
                                                ? 'border-kh-purple bg-purple-50 text-kh-purple'
                                                : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'}
                    `}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                            <input type="hidden" {...register("platform", { required: "Please select a platform" })} />
                            {errors.platform && <p className="text-red-500 text-xs mt-1">{errors.platform.message}</p>}
                        </section>

                        {/* Order Details */}
                        <section className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order Title</label>
                                <input
                                    {...register("title", { required: "Title is required" })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple outline-none transition-all"
                                    placeholder="e.g. Midnight Snacks, Dinner from Behrouz"
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cutoff Time</label>
                                    <input
                                        type="time"
                                        {...register("cutoffTime", { required: "Cutoff time is required" })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple outline-none transition-all"
                                    />
                                    {errors.cutoffTime && <p className="text-red-500 text-xs mt-1">{errors.cutoffTime.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min. Order Value (Optional)</label>
                                    <input
                                        type="number"
                                        {...register("minOrderValue")}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple outline-none transition-all"
                                        placeholder="₹"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes (Optional)</label>
                                <textarea
                                    {...register("description")}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple outline-none transition-all resize-none"
                                    placeholder="Any specific instructions? e.g. 'Ordering from the Civil Lines outlet'"
                                />
                            </div>
                        </section>

                        {/* Info Box */}
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-bold mb-1">How it works:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>You start the cart and set a cutoff time.</li>
                                    <li>Others add items and pay their share to you (Escrow).</li>
                                    <li>Once cutoff is reached, you place the order on the app.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-kh-purple hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-900/20 transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Creating Group Order..." : "Start Group Order"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}
