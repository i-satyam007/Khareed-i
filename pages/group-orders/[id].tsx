import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Clock, ShoppingCart, Plus, Trash2, User, ArrowRight, CheckCircle } from 'lucide-react';

// Mock Data
const MOCK_ORDER = {
    id: 99,
    title: "Midnight snacks run",
    platform: "Blinkit",
    host: "Aman (BH-3)",
    cutoffTime: "23:15",
    status: "Open",
    participants: [
        { id: 1, name: "Aman", items: [{ name: "Chips", price: 50 }, { name: "Coke", price: 40 }] },
        { id: 2, name: "Rohan", items: [{ name: "Maggi", price: 60 }] },
    ]
};

export default function GroupOrderDetailsPage() {
    const router = useRouter();
    const { id } = router.query;

    // Local state for adding items
    const [newItemName, setNewItemName] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");

    // Mock State for UI interactivity
    const [order, setOrder] = useState(MOCK_ORDER);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName || !newItemPrice) return;

        const newItem = { name: newItemName, price: parseFloat(newItemPrice) };

        // Add to current user (Mock: assuming User ID 1 is current user)
        const updatedParticipants = order.participants.map(p => {
            if (p.id === 1) {
                return { ...p, items: [...p.items, newItem] };
            }
            return p;
        });

        setOrder({ ...order, participants: updatedParticipants });
        setNewItemName("");
        setNewItemPrice("");
    };

    // Calculations
    const totalCartValue = order.participants.reduce((acc, p) => acc + p.items.reduce((sum, i) => sum + i.price, 0), 0);
    const deliveryFee = 50; // Fixed for mock
    const handlingFee = 10;
    const totalFees = deliveryFee + handlingFee;
    const finalTotal = totalCartValue + totalFees;

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <Head>
                <title>{order.title} | Khareed-i Group Order</title>
            </Head>

            {/* Header / Status Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {order.platform} <span className="text-gray-400">/</span> {order.title}
                        </h1>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" /> Cutoff: {order.cutoffTime} • Hosted by {order.host}
                        </p>
                    </div>
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        {order.status}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Cart Items */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Add Item Form */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add Item to Cart
                        </h3>
                        <form onSubmit={handleAddItem} className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Item Name (e.g. Lays Blue)"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-kh-purple"
                            />
                            <input
                                type="number"
                                placeholder="Price (₹)"
                                value={newItemPrice}
                                onChange={(e) => setNewItemPrice(e.target.value)}
                                className="w-24 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-kh-purple"
                            />
                            <button type="submit" className="bg-kh-purple hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                                Add
                            </button>
                        </form>
                    </div>

                    {/* Participants List */}
                    <div className="space-y-4">
                        {order.participants.map((participant) => {
                            const userTotal = participant.items.reduce((sum, i) => sum + i.price, 0);
                            // Weighted split logic: (UserTotal / CartTotal) * Fees
                            const userShare = totalCartValue > 0 ? (userTotal / totalCartValue) * totalFees : 0;
                            const userFinal = userTotal + userShare;

                            return (
                                <div key={participant.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">
                                                {participant.name[0]}
                                            </div>
                                            <span className="font-bold text-gray-900 text-sm">{participant.name}</span>
                                            {participant.id === 1 && <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">You</span>}
                                        </div>
                                        <div className="text-sm font-bold text-gray-900">₹{Math.round(userFinal)}</div>
                                    </div>

                                    <div className="p-4 space-y-2">
                                        {participant.items.length > 0 ? (
                                            participant.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">{item.name}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-gray-900 font-medium">₹{item.price}</span>
                                                        {participant.id === 1 && (
                                                            <button className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No items added yet.</p>
                                        )}
                                    </div>

                                    {/* Breakdown for this user */}
                                    <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100 text-[10px] text-gray-500 flex justify-between">
                                        <span>Items: ₹{userTotal}</span>
                                        <span>+ Fees (Split): ₹{Math.round(userShare)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>

                {/* Right: Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                        <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>

                        <div className="space-y-2 text-sm mb-4 border-b border-gray-100 pb-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Cart Total</span>
                                <span>₹{totalCartValue}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery Fee</span>
                                <span>₹{deliveryFee}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Handling Fee</span>
                                <span>₹{handlingFee}</span>
                            </div>
                        </div>

                        <div className="flex justify-between font-bold text-lg text-gray-900 mb-6">
                            <span>Total Payable</span>
                            <span>₹{finalTotal}</span>
                        </div>

                        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2">
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
