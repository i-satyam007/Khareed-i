import React from 'react';
import Link from 'next/link';
import { User, Package, ShoppingBag, LogOut, Heart, Shield, BadgeCheck } from 'lucide-react';

interface DashboardSidebarProps {
    user: any;
    activeTab?: string;
}

export default function DashboardSidebar({ user, activeTab }: DashboardSidebarProps) {
    if (!user) return null;

    return (
        <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="p-6 bg-kh-purple/5 border-b border-gray-100 text-center rounded-t-2xl">
                    <div className="w-20 h-20 bg-kh-purple/20 rounded-full flex items-center justify-center text-2xl font-bold text-kh-purple mx-auto mb-3 overflow-hidden">
                        {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user.name?.[0]}
                    </div>

                    <div className="flex items-center justify-center gap-1 flex-wrap">
                        <h2 className="font-bold text-gray-900">{user.name}</h2>

                        {/* Verified Student Badge */}
                        {(user.isVerifiedStudent || user.email?.endsWith('@iimidr.ac.in')) && (
                            <div className="relative group/verified">
                                <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-500 text-white" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/verified:block w-max px-2 py-1 bg-gray-800 text-white text-[10px] rounded shadow-lg z-50 whitespace-nowrap">
                                    Verified IIM Indore Student
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></div>
                                </div>
                            </div>
                        )}

                        {/* Admin Badge */}
                        {user.role === 'admin' && (
                            <div className="relative group/admin">
                                <Shield className="h-4 w-4 text-yellow-500 fill-yellow-500 text-white" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/admin:block w-max px-2 py-1 bg-gray-800 text-white text-[10px] rounded shadow-lg z-50 whitespace-nowrap">
                                    Admin
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-gray-500">@{user.username}</p>
                </div>

                <nav className="p-2 space-y-1">
                    <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-purple-50 text-kh-purple' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                        <User className="h-5 w-5" /> My Profile
                    </Link>
                    <Link href="/dashboard?tab=watchlist" className={`flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${activeTab === 'watchlist' ? 'bg-purple-50 text-kh-purple' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                        <Heart className="h-5 w-5" /> My Watchlist
                    </Link>

                    {user.role === 'admin' && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold rounded-xl transition-colors">
                            <Shield className="h-5 w-5" /> Admin Dashboard
                        </Link>
                    )}

                    <Link href="/dashboard/my-listings" className={`flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${activeTab === 'my-listings' ? 'bg-purple-50 text-kh-purple' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                        <Package className="h-5 w-5" /> My Listings
                    </Link>
                    <Link href="/dashboard/my-orders" className={`flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${activeTab === 'my-orders' ? 'bg-purple-50 text-kh-purple' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                        <ShoppingBag className="h-5 w-5" /> My Orders
                    </Link>
                    <Link href="/api/auth/logout" className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors mt-2">
                        <LogOut className="h-5 w-5" /> Sign Out
                    </Link>
                </nav>
            </div>
        </aside>
    );
}
