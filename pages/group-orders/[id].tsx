import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Clock, ShoppingCart, Plus, Trash2, User, ArrowRight, CheckCircle } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import { useUser } from '@/lib/hooks/useUser';

export default function GroupOrderDetailsPage() {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useUser();

    // Local state for adding items
    const [newItemName, setNewItemName] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: order, isLoading, mutate: mutateOrder } = useSWR(id ? `/api/group-orders/${id}` : null, fetcher);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName || !newItemPrice) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/group-orders/${id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newItemName, price: newItemPrice }),
            });

            if (res.ok) {
                setNewItemName("");
                setNewItemPrice("");
                mutateOrder();
            } else {
                const error = await res.json();
                alert(error.message || 'Failed to add item');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteItem = async (itemId: number) => {
        if (!confirm('Are you sure you want to remove this item?')) return;
        try {
            const res = await fetch(`/api/group-orders/${id}/items`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId }),
            });

            if (res.ok) {
                mutateOrder();
            } else {
                const error = await res.json();
                alert(error.message || 'Failed to delete item');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handlePay = async () => {
        if (!confirm('Proceed to pay for your share?')) return;
        try {
            const res = await fetch(`/api/group-orders/${id}/pay`, {
                method: 'POST',
            });

            if (res.ok) {
                alert('Payment initiated! (Escrow)');
                router.push('/orders'); // Redirect to orders page
            } else {
                const error = await res.json();
                alert(error.message || 'Failed to initiate payment');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading || !order) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    // Calculations
    const totalCartValue = order.participants.reduce((acc: number, p: any) => acc + p.items.reduce((sum: number, i: any) => sum + i.price, 0), 0);
    const deliveryFee = 50; // Fixed for mock
    const handlingFee = 10;
    const totalFees = deliveryFee + handlingFee;
    const finalTotal = totalCartValue + totalFees;

    // Current User's Share
    const currentUserPart = order.participants.find((p: any) => p.id === user?.id);
    const userTotal = currentUserPart ? currentUserPart.items.reduce((sum: number, i: any) => sum + i.price, 0) : 0;
    const userShare = totalCartValue > 0 ? (userTotal / totalCartValue) * totalFees : 0;
    const userFinal = userTotal + userShare;

    return (
        <div className="min-h-screen bg-kh-light font-sans pb-20">
            <Head>
                <title>{order.title} | Khareed-i Group Order</title>
            </Head>

            {/* Header / Status Bar */}
            <div className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            {order.platform} <span className="text-gray-400">/</span> {order.title}
                        </h1>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" /> Cutoff: {new Date(order.cutoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Hosted by {order.creator.name}
                        </p>
                    </div>
                    <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-500/20">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        {order.status.toUpperCase()}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Cart Items */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Add Item Form */}
                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-sm">
                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add Item to Cart
                        </h3>
                        <form onSubmit={handleAddItem} className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Item Name (e.g. Lays Blue)"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="flex-1 px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-kh-purple placeholder-gray-500"
                            />
                            <input
                                type="number"
                                placeholder="Price (₹)"
                                value={newItemPrice}
                                onChange={(e) => setNewItemPrice(e.target.value)}
                                className="w-24 px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-kh-purple placeholder-gray-500"
                            />
                            <button type="submit" disabled={isSubmitting} className="bg-kh-purple hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50">
                                {isSubmitting ? '...' : 'Add'}
                            </button>
                        </form>
                    </div>

                    {/* Participants List */}
                    <div className="space-y-4">
                        {order.participants.map((participant: any) => {
                            const pUserTotal = participant.items.reduce((sum: number, i: any) => sum + i.price, 0);
                            const pUserShare = totalCartValue > 0 ? (pUserTotal / totalCartValue) * totalFees : 0;
                            const pUserFinal = pUserTotal + pUserShare;

                            return (
                                <div key={participant.id} className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
                                    <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-purple-500/10 rounded-full flex items-center justify-center text-xs font-bold text-purple-400 overflow-hidden">
                                                {participant.avatar ? (
                                                    <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    participant.name[0]
                                                )}
                                            </div>
                                            <span className="font-bold text-white text-sm">{participant.name}</span>
                                            {participant.id === user?.id && <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">You</span>}
                                        </div>
                                        <div className="text-sm font-bold text-white">₹{Math.round(pUserFinal)}</div>
                                    </div>

                                    <div className="p-4 space-y-2">
                                        {participant.items.length > 0 ? (
                                            participant.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-300">{item.name}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-white font-medium">₹{item.price}</span>
                                                        {participant.id === user?.id && (
                                                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No items added yet.</p>
                                        )}
                                    </div>

                                    {/* Breakdown for this user */}
                                    <div className="px-4 py-2 bg-white/5 border-t border-white/10 text-[10px] text-gray-400 flex justify-between">
                                        <span>Items: ₹{pUserTotal}</span>
                                        <span>+ Fees (Split): ₹{Math.round(pUserShare)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>

                {/* Right: Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-sm sticky top-24">
                        <h3 className="font-bold text-white mb-4">Order Summary</h3>

                        <div className="space-y-2 text-sm mb-4 border-b border-white/10 pb-4">
                            <div className="flex justify-between text-gray-400">
                                <span>Cart Total</span>
                                <span>₹{totalCartValue}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Delivery Fee</span>
                                <span>₹{deliveryFee}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Handling Fee</span>
                                <span>₹{handlingFee}</span>
                            </div>
                        </div>

                        <div className="flex justify-between font-bold text-lg text-white mb-6">
                            <span>Total Payable</span>
                            <span>₹{finalTotal}</span>
                        </div>

                        {userTotal > 0 && (
                            <div className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                <p className="text-xs text-purple-300 font-bold mb-1">Your Share:</p>
                                <div className="flex justify-between text-sm font-bold text-purple-200">
                                    <span>Payable Now</span>
                                    <span>₹{Math.round(userFinal)}</span>
                                </div>
                            </div>
                        )}

                        <button onClick={handlePay} disabled={userTotal === 0} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            Proceed to Pay <ArrowRight className="h-4 w-4" />
                        </button>

                        <p className="text-xs text-center text-gray-400 mt-3">
                            Payments are held in escrow until the order is placed.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
