import Head from 'next/head';
import useSWR from 'swr';
import { ShoppingBag, Calendar, MapPin } from 'lucide-react';

export default function MyOrdersPage() {
    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: orders, isLoading, error } = useSWR('/api/orders', fetcher);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center">Error loading orders</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head>
                <title>My Orders | Khareed-i</title>
            </Head>

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <ShoppingBag className="h-8 w-8 text-kh-purple" />
                    My Orders
                </h1>

                {orders && orders.length > 0 ? (
                    <div className="space-y-6">
                        {orders.map((order: any) => (
                            <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex gap-6 text-sm text-gray-600">
                                        <div>
                                            <p className="font-medium text-gray-900">Order Placed</p>
                                            <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Total Amount</p>
                                            <p className="font-bold">₹{order.amount}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Order ID</p>
                                            <p>#{order.id}</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
                                        {order.status}
                                    </div>
                                </div>

                                <div className="p-6">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="flex gap-6">
                                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                                {item.listing.imagePath ? (
                                                    <img src={item.listing.imagePath} alt={item.listing.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">📷</div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.listing.title}</h3>
                                                <p className="text-sm text-gray-600 mb-4">Sold by <span className="font-medium">{item.listing.owner.name}</span></p>
                                                <div className="flex items-center gap-4">
                                                    <button className="text-kh-purple text-sm font-bold hover:underline">
                                                        View Listing
                                                    </button>
                                                    <button className="text-gray-500 text-sm font-medium hover:text-gray-900">
                                                        Write a Review
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
                        <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-6">Looks like you haven't bought anything yet.</p>
                        <a href="/" className="inline-block bg-kh-purple text-white font-bold py-3 px-8 rounded-xl hover:bg-purple-700 transition-colors">
                            Start Shopping
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
