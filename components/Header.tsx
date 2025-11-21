import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, ChevronDown, Users } from 'lucide-react';
import { useRouter } from 'next/router';

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Books",
  "Hostel Essentials",
  "Clothing",
  "Sports Gear",
  "Stationery"
];

export default function Header() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(category === "All Categories" ? "" : category)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      {/* Top Bar (Optional - for promos or small links) */}
      <div className="bg-kh-dark text-white text-xs py-1 px-4 text-center hidden md:block">
        🚀 Khareed-i: The Ultimate IPM Reselling Marketplace & Group Ordering Platform
      </div>

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Section - Using Logo.svg with text */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img
              src="/Logo.svg"
              alt="Khareed-i Logo"
              className="h-14"
              style={{ height: '56px' }}
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-extrabold text-gray-900 leading-none tracking-tight">Khareed-i</h1>
              <p className="text-[10px] font-bold text-kh-purple tracking-widest uppercase">IPM Marketplace</p>
            </div>
          </Link>

          {/* Search Bar - Desktop (Centered and Expanded) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="w-full flex items-center bg-gray-100 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-kh-purple/20 focus-within:border-kh-purple transition-all overflow-hidden shadow-sm">

              {/* Category Dropdown */}
              <div className="relative group border-r border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="appearance-none bg-transparent py-2.5 pl-4 pr-8 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer w-[140px] truncate"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more..."
                className="flex-1 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              />

              {/* Search Button */}
              <button type="submit" className="bg-kh-red hover:bg-red-600 text-white px-6 py-2.5 transition-colors font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center gap-6 flex-shrink-0">

            {/* Group Order CTA */}
            <Link href="/group-orders" className="hidden lg:flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-kh-red transition-colors group">
              <div className="p-2 bg-orange-50 rounded-full group-hover:bg-orange-100 transition-colors">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <span>Group Order</span>
            </Link>

            {/* Sell Button */}
            <Link href="/listings/create" className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-kh-purple transition-colors">
              <span>Sell</span>
            </Link>

            {/* Auth Buttons (If not logged in - Mock) */}
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-kh-purple">Login</Link>
              <Link href="/signup" className="bg-gray-900 hover:bg-black text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-gray-900/20">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (Visible only on mobile) */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
          <Search className="h-4 w-4 text-gray-500 ml-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Khareed-i..."
            className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
          />
        </form>
      </div>
    </header>
  );
}