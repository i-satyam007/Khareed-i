import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, ChevronDown, Users, ShoppingBag, Bell, X, CheckCircle, AlertCircle, Info, Heart, Shield } from 'lucide-react';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import { useUser } from '@/lib/hooks/useUser';

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Books",
  "Hostel Essentials",
  "Clothing",
  "Sports Gear",
  "Stationery",
  "Food",
  "Grocery",
  "Other"
];

// Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
  const bgColors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-5 fade-in duration-300 ${bgColors[type]} max-w-sm bg-white`}>
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button onClick={onClose} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default function Header() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number, message: string, type: 'success' | 'error' | 'info' }[]>([]);
  const router = useRouter();

  // Auth Check using custom hook
  const { user } = useUser();

  // Local fetcher for notifications
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  // Notifications
  const { data: notifications = [], mutate: mutateNotifications } = useSWR(user ? "/api/notifications" : null, fetcher);

  // Filter notifications - Ensure it's an array to prevent crashes
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const generalNotifications = safeNotifications; // Show all notifications in the list
  const alertNotifications = safeNotifications.filter((n: any) => n.type === 'alert' && !n.read);
  const unreadCount = generalNotifications.filter((n: any) => !n.read).length;

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Handle Alerts
  useEffect(() => {
    if (alertNotifications.length > 0) {
      const processAlerts = async () => {
        const newToasts: { id: number, message: string, type: 'success' | 'error' | 'info' }[] = [];
        const markReadPromises: Promise<any>[] = [];

        alertNotifications.forEach((alert: any) => {
          // Prevent duplicate toasts if already visible (basic check)
          if (toasts.some(t => t.message === `${alert.title}: ${alert.body}`)) return;

          // Determine type based on content
          let type: 'success' | 'error' | 'info' = 'info';
          const title = alert.title || "";
          if (title.toLowerCase().includes('created') || title.toLowerCase().includes('success')) type = 'success';
          if (title.toLowerCase().includes('deleted') || title.toLowerCase().includes('error')) type = 'error';
          if (title.toLowerCase().includes('updated') || title.toLowerCase().includes('edited')) type = 'info';

          newToasts.push({ id: Date.now() + Math.random(), message: `${alert.title}: ${alert.body}`, type });

          // Queue mark as read
          markReadPromises.push(
            fetch('/api/notifications', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: alert.id })
            })
          );
        });

        if (newToasts.length > 0) {
          setToasts(prev => [...prev, ...newToasts]);

          // Wait for all to be marked as read BEFORE mutating
          await Promise.all(markReadPromises);
          mutateNotifications();
        }
      };

      processAlerts();
    }
  }, [alertNotifications, mutateNotifications]);

  // Handle URL Query Alerts (Created, Updated, Deleted)
  useEffect(() => {
    if (router.query.alert) {
      const alertType = router.query.alert as string;
      let message = "";
      let type: 'success' | 'error' | 'info' = 'info';

      if (alertType === 'created') {
        message = "Listing created successfully!";
        type = 'success';
      } else if (alertType === 'updated') {
        message = "Listing updated successfully!";
        type = 'info';
      } else if (alertType === 'deleted') {
        message = "Listing deleted successfully!";
        type = 'error';
      } else if (alertType === 'order_placed') {
        message = "Order placed successfully!";
        type = 'success';
      } else if (alertType === 'payment_submitted') {
        message = "Payment screenshot submitted!";
        type = 'success';
      }

      if (message) {
        setToasts(prev => [...prev, { id: Date.now(), message, type }]);

        // Clear query param without reload
        const newQuery = { ...router.query };
        delete newQuery.alert;
        router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
      }
    }
  }, [router.query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(category === "All Categories" ? "" : category)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
    } catch (error) {
      console.error("Logout failed", error);
    }
    // Force full reload to clear all states and cache
    window.location.href = "/";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-dropdown') && !target.closest('.notification-btn')) {
        setIsNotifOpen(false);
      }
      if (!target.closest('.user-dropdown') && !target.closest('.user-btn')) {
        setIsMenuOpen(false);
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
          if (title.toLowerCase().includes('deleted') || title.toLowerCase().includes('error')) type = 'error';
                if (title.toLowerCase().includes('updated') || title.toLowerCase().includes('edited')) type = 'info';

                newToasts.push({id: Date.now() + Math.random(), message: `${alert.title}: ${alert.body}`, type });

                // Queue mark as read
                markReadPromises.push(
                fetch('/api/notifications', {
                  method: 'PUT',
                headers: {'Content-Type': 'application/json' },
                body: JSON.stringify({id: alert.id })
            })
                );
        });

        if (newToasts.length > 0) {
                  setToasts(prev => [...prev, ...newToasts]);

                // Wait for all to be marked as read BEFORE mutating
                await Promise.all(markReadPromises);
                mutateNotifications();
        }
      };

                processAlerts();
    }
  }, [alertNotifications, mutateNotifications]);

  // Handle URL Query Alerts (Created, Updated, Deleted)
  useEffect(() => {
    if (router.query.alert) {
      const alertType = router.query.alert as string;
                let message = "";
                let type: 'success' | 'error' | 'info' = 'info';

                if (alertType === 'created') {
                  message = "Listing created successfully!";
                type = 'success';
      } else if (alertType === 'updated') {
                  message = "Listing updated successfully!";
                type = 'info';
      } else if (alertType === 'deleted') {
                  message = "Listing deleted successfully!";
                type = 'error';
      } else if (alertType === 'order_placed') {
                  message = "Order placed successfully!";
                type = 'success';
      } else if (alertType === 'payment_submitted') {
                  message = "Payment screenshot submitted!";
                type = 'success';
      }

                if (message) {
                  setToasts(prev => [...prev, { id: Date.now(), message, type }]);

                // Clear query param without reload
                const newQuery = {...router.query};
                delete newQuery.alert;
                router.replace({pathname: router.pathname, query: newQuery }, undefined, {shallow: true });
      }
    }
  }, [router.query]);

  const handleSearch = (e: React.FormEvent) => {
                  e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/listings?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(category === "All Categories" ? "" : category)}`);
    }
  };

  const handleLogout = async () => {
    try {
                  await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
    } catch (error) {
                  console.error("Logout failed", error);
    }
                // Force full reload to clear all states and cache
                window.location.href = "/";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
                if (!target.closest('.notification-dropdown') && !target.closest('.notification-btn')) {
                  setIsNotifOpen(false);
      }
                if (!target.closest('.user-dropdown') && !target.closest('.user-btn')) {
                  setIsMenuOpen(false);
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
                                <div className="w-8 h-8 bg-kh-purple/10 rounded-full flex items-center justify-center text-kh-purple font-bold text-xs">
                                  {user.name ? user.name[0].toUpperCase() : <User className="h-4 w-4" />}
                                </div>
                                <div className="hidden sm:block text-left">
                                  <p className="text-[10px] text-gray-500 font-medium leading-tight">Hello,</p>
                                  <p className="text-xs font-bold text-gray-900 leading-tight">{user.name?.split(' ')[0] || user.username}</p>
                                </div>
                                <ChevronDown className={`h-3 w-3 text-gray-400 hidden sm:block transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                              </button>

                              {/* Dropdown Menu */}
                              {isMenuOpen && (
                                <div className="user-dropdown absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                  </div>

                                  {user.role === 'admin' && (
                                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors font-bold">
                                      <Shield className="h-4 w-4" />
                                      Admin Dashboard
                                    </Link>
                                  )}

                                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    <User className="h-4 w-4 text-gray-400" />
                                    My Profile
                                  </Link>
                                  <Link href="/dashboard?tab=watchlist" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    <Heart className="h-4 w-4 text-gray-400" />
                                    My Watchlist
                                  </Link>
                                  <Link href="/dashboard/my-orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    <ShoppingBag className="h-4 w-4 text-gray-400" />
                                    My Orders
                                  </Link>

                                  <div className="h-px bg-gray-100 my-1" />

                                  <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
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