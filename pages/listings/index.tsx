import React, { useState } from 'react';
import Head from 'next/head';

import ListingCard from '../../components/ListingCard';
import { Filter, SlidersHorizontal, X } from 'lucide-react';

const MOCK_LISTINGS = [
    { id: 1, title: "Scientific Calculator FX-991ES (Barely used)", price: 650, mrp: 950, negotiable: true, category: "Stationery" },
    { id: 2, title: "IPM Quant Book Bundle (IMS + TIME)", price: 1200, mrp: 2200, negotiable: false, category: "Books" },
    { id: 3, title: "Table Lamp with Study Light", price: 400, mrp: 800, negotiable: true, category: "Hostel Essentials" },
    { id: 4, title: "Basic Dumbbell Set (2 x 5kg)", price: 900, mrp: 1500, negotiable: true, category: "Sports Gear" },
    { id: 5, title: "Wireless Mouse Logitech", price: 550, mrp: 999, negotiable: false, category: "Electronics" },
    { id: 6, title: "Mattress Topper (Single Bed)", price: 800, mrp: 1800, negotiable: true, category: "Hostel Essentials" },
];

const CATEGORIES = ["All Categories", "Electronics", "Books", "Hostel Essentials", "Clothing", "Sports Gear", "Stationery"];

export default function ListingsPage() {
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [priceRange, setPriceRange] = useState(5000);
    const [onlyNegotiable, setOnlyNegotiable] = useState(false);

    const filteredListings = MOCK_LISTINGS.filter(item => {
        const catMatch = selectedCategory === "All Categories" || item.category === selectedCategory;
        const priceMatch = item.price <= priceRange;
        const negMatch = !onlyNegotiable || item.negotiable;
        return catMatch && priceMatch && negMatch;
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head>
                <title>All Listings | Khareed-i</title>
            </Head>



            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Mobile Filter Toggle */}
                    <button
                        className="lg:hidden flex items-center gap-2 text-sm font-bold text-gray-700 bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="h-4 w-4" /> Filters
                    </button>

                    {/* Sidebar Filters */}
                    <aside className={`
            fixed inset-0 z-40 bg-white p-6 lg:static lg:block lg:w-64 lg:bg-transparent lg:p-0 lg:z-auto transition-transform duration-300 ease-in-out
            ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
                        <div className="flex items-center justify-between mb-6 lg:hidden">
                            <h2 className="text-xl font-bold">Filters</h2>
                            <button onClick={() => setShowFilters(false)}><X className="h-6 w-6" /></button>
                        </div>

                        <div className="space-y-8">
                            {/* Categories */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Categories</h3>
                                <div className="space-y-2">
                                    {CATEGORIES.map(cat => (
                                        <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={selectedCategory === cat}
                                                onChange={() => setSelectedCategory(cat)}
                                                className="text-kh-red focus:ring-kh-red"
                                            />
                                            <span className={`text-sm ${selectedCategory === cat ? 'text-kh-red font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                {cat}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Max Price: ₹{priceRange}</h3>
                                <input
                                    type="range"
                                    min="0"
                                    max="10000"
                                    step="100"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-kh-red"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>₹0</span>
                                    <span>₹10,000+</span>
                                </div>
                            </div>

                            {/* Toggles */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Preferences</h3>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={onlyNegotiable}
                                        onChange={(e) => setOnlyNegotiable(e.target.checked)}
                                        className="rounded text-kh-red focus:ring-kh-red"
                                    />
                                    <span className="text-sm text-gray-700">Negotiable Only</span>
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Main Grid */}
                    <main className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-xl font-bold text-gray-900">
                                {selectedCategory === "All Categories" ? "All Listings" : selectedCategory}
                                <span className="text-gray-500 text-sm font-normal ml-2">({filteredListings.length} items)</span>
                            </h1>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                                <select className="bg-white border border-gray-200 text-sm rounded-lg p-2 focus:outline-none focus:border-kh-purple">
                                    <option>Newest First</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {filteredListings.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredListings.map(item => (
                                    <ListingCard key={item.id} {...item} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-500">No items match your filters.</p>
                                <button
                                    onClick={() => { setSelectedCategory("All Categories"); setPriceRange(10000); setOnlyNegotiable(false); }}
                                    className="mt-2 text-kh-red font-medium hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </main>

                </div>
            </div>
        </div>
    );
}
