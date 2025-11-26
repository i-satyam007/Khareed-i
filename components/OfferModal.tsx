import { useState } from 'react';
import { X } from 'lucide-react';

interface OfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number) => void;
    listingTitle: string;
    price: number;
}

export default function OfferModal({ isOpen, onClose, onSubmit, listingTitle, price }: OfferModalProps) {
    const [amount, setAmount] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(Number(amount));
        setAmount('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-2">Make an Offer</h2>
                <p className="text-gray-600 mb-6">
                    Enter your offer for <span className="font-semibold">{listingTitle}</span>.
                    The listed price is ₹{price}.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Offer Amount (₹)
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${Number(amount) > price
                                    ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                }`}
                            placeholder="e.g. 500"
                        />
                        {Number(amount) > price && (
                            <p className="text-red-500 text-xs mt-1 font-medium">
                                Offer amount cannot be greater than the listed price (₹{price}).
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!amount || Number(amount) > price}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit Offer
                    </button>
                </form>
            </div>
        </div>
    );
}
