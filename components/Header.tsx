import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, Bell, User, ShoppingBag, LogOut, ChevronDown, Menu, X, Heart, Shield, Users, MessageCircle, CheckCircle, BadgeCheck } from 'lucide-react';
import { useUser } from '../lib/hooks/useUser';
import useSWR from 'swr';
import UnreadChatBadge from './UnreadChatBadge';

const CATEGORIES = [
  "All Categories",
  "Books & Notes",
  "Electronics",
  "Furniture",
  "Clothing",
  "Sports Gear",
  "Stationery",
  "Others"
];

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300 animate-in fade-in slide-in-from-top-2 flex items-center gap-2 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
      {type === 'success' ? <CheckCircle className="h-5 w-5" /> : <X className="h-5 w-5" />}
      <span className="font-bold">{message}</span>
    </div>
  );
};

export default function Header() {
  const { user, logout } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState("All Categories");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number, message: string, type: 'success' | 'error' }[]>([]);

  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: notifications, mutate: mutateNotifications } = useSWR(user ? '/api/notifications' : null, fetcher);

  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;
  const generalNotifications = notifications?.filter((n: any) => n.type !== 'chat') || [];

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Expose toast function globally
  useEffect(() => {
    (window as any).showToast = addToast;
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(category)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    router.push('/login');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown') && !target.closest('.user-btn')) {
        setIsMenuOpen(false);
      }
      if (!target.closest('.notification-dropdown') && !target.closest('.notification-btn')) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PUT' });
    mutateNotifications();
  };

  return (
    <>
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-2">
          {toasts.map(toast => (
            <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        {/* Top Bar */}
        <div className="bg-kh-dark text-white text-xs py-1 px-4 text-center hidden md:block">
          🚀 Khareed-i: The Ultimate IPM Reselling Marketplace & Group Ordering Platform
        </div>

        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Section */}
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

            {/* Search Bar */}
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

              {/* Chat Icon */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative outline-none text-gray-700 hover:text-kh-purple"
                title="Messages"
              >
                <MessageCircle className="h-6 w-6" />
                {user && <UnreadChatBadge />}
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="notification-btn p-2 hover:bg-gray-100 rounded-full transition-colors relative outline-none"
                >
                  <Bell className="h-6 w-6 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotifOpen && (
                  <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-kh-purple hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {generalNotifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                      ) : (
                        generalNotifications.map((n: any) => (
                          <div
                            key={n.id}
                            onClick={async () => {
                              if (!n.read) {
                                await fetch('/api/notifications', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: n.id })
                                });
                                mutateNotifications();
                              }
                              if (n.link) {
                                router.push(n.link);
                                setIsNotifOpen(false);
                              }
                            }}
                            className={`px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer ${!n.read ? 'bg-blue-50/50' : ''}`}
                          >
                            <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.body}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Account Section */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="user-btn flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors outline-none"
                  >
                    <div className="w-8 h-8 bg-kh-purple/10 rounded-full flex items-center justify-center text-kh-purple font-bold text-xs overflow-hidden relative">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name ? user.name[0].toUpperCase() : <User className="h-4 w-4" />
                      )}
                      {(user.pendingDeliveryCount > 0) && (
                        <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white transform translate-x-1/4 -translate-y-1/4"></span>
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-[10px] text-gray-500 font-medium leading-tight">Hello,</p>
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-bold text-gray-900 leading-tight">{user.name?.split(' ')[0] || user.username}</p>
                        {user.role === 'admin' && (
                          <Shield className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        )}
                        {(user.isVerifiedStudent || user.email?.endsWith('@iimidr.ac.in')) && (
                          <div className="relative group/verified">
                            <BadgeCheck className="h-3.5 w-3.5 text-blue-500 fill-blue-500 text-white" />
                            <div className="absolute right-0 bottom-full mb-2 hidden group-hover/verified:block w-max px-2 py-1 bg-gray-800 text-white text-[10px] rounded shadow-lg z-50 whitespace-nowrap">
                              Verified IIM Indore Student
                              <div className="absolute right-1 top-full border-4 border-transparent border-t-gray-800"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronDown className={`h-3 w-3 text-gray-400 hidden sm:block transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="user-dropdown absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                          {user.role === 'admin' && (
                            <Shield className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      {user.role === 'admin' && (
                        <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors font-bold">
                          <Shield className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User className="h-4 w-4 text-gray-400" />
                        My Profile
                      </Link>
                      <Link href="/dashboard?tab=watchlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Heart className="h-4 w-4 text-gray-400" />
                        My Watchlist
                      </Link>
                      <Link href="/dashboard/my-orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <ShoppingBag className="h-4 w-4 text-gray-400" />
                        My Orders
                      </Link>

                      {/* Verify Payments Link */}
                      <Link href="/dashboard/verify-payments" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors relative justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-gray-400" />
                          Verify Payments
                        </div>
                        {(user.pendingDeliveryCount > 0) && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{user.pendingDeliveryCount}</span>
                        )}
                      </Link>

                      <div className="h-px bg-gray-100 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[10px] text-gray-500 font-medium leading-tight">Hello, Sign in</p>
                    <p className="text-xs font-bold text-gray-900 leading-tight">Account</p>
                  </div>
                  <ChevronDown className="h-3 w-3 text-gray-400 hidden sm:block" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
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
    </>
  );
}