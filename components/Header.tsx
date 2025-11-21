import React, { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
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

      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 hover:opacity-90 transition-opacity">
          <Logo className="h-10 w-auto" />
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl items-center bg-gray-100 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-kh-purple/20 focus-within:border-kh-purple transition-all overflow-hidden">

          {/* Category Dropdown */}
          <div className="relative group border-r border-gray-300">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none bg-transparent py-2.5 pl-4 pr-8 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer hover:bg-gray-200 transition-colors"
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
            className="flex-1 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
          />

          {/* Search Button */}
          <button type="submit" className="bg-kh-red hover:bg-red-600 text-white px-5 py-2.5 transition-colors">
            <Search className="h-5 w-5" />
          </button>
        </form>

        {/* Navigation Icons */}
        <div className="flex items-center gap-6">

          {/* Group Order CTA */}
          <Link href="/group-order" className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-kh-red transition-colors group">
            <div className="p-2 bg-orange-50 rounded-full group-hover:bg-orange-100 transition-colors">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <span>Group Order</span>
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative group">
            <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-kh-purple transition-colors" />
            <span className="absolute -top-2 -right-2 bg-kh-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">0</span>
          </Link>

          {/* Profile / Login */}
          <Link href="/login" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-kh-purple transition-colors">
            <div className="p-1.5 bg-gray-100 rounded-full">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div className="hidden sm:block text-xs">
              <p className="text-gray-500 leading-none mb-1">Hello, Sign in</p>
              <p className="font-bold leading-none">Account</p>
            </div>
          </Link>
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