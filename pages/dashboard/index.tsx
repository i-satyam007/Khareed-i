import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { User, MapPin, Phone, Mail, Package, ShoppingBag, LogOut, Camera } from 'lucide-react';

// Mock User Data
const MOCK_USER = {
    name: "Satyam Kumar",
    email: "satyam@ipm.edu",
    username: "satyam_k",
    hostel: "BH-3, Room 204",
    phone: "+91 98765 43210",
    avatar: null
};

export default function DashboardProfile() {
    const [user, setUser] = useState(MOCK_USER);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(MOCK_USER);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setUser(formData);
        setIsEditing(false);
        // Simulate API call
        alert("Profile updated successfully!");
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head>
                <title>My Profile | Khareed-i</title>
            </Head>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 bg-kh-purple/5 border-b border-gray-100 text-center">
                                <div className="w-20 h-20 bg-kh-purple/20 rounded-full flex items-center justify-center text-2xl font-bold text-kh-purple mx-auto mb-3">
                                    {user.name[0]}
                                </div>
                                <h2 className="font-bold text-gray-900">{user.name}</h2>
                                <p className="text-xs text-gray-500">@{user.username}</p>
                            </div>

                            <nav className="p-2">
                                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-purple-50 text-kh-purple font-medium rounded-xl transition-colors">
                                    <User className="h-5 w-5" /> My Profile
                                </Link>
                                <Link href="/dashboard/my-listings" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-xl transition-colors">
                                    <Package className="h-5 w-5" /> My Listings
                                </Link>
                                <Link href="/dashboard/my-orders" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-xl transition-colors">
                                    <ShoppingBag className="h-5 w-5" /> My Orders
                                </Link>
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors mt-2">
                                    <LogOut className="h-5 w-5" /> Sign Out
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">Profile Details</h1>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-sm font-medium text-kh-purple hover:underline"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSave} className="space-y-6 max-w-2xl">

                                {/* Avatar Upload (Mock) */}
                                <div className="flex items-center gap-4">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 overflow-hidden border-2 border-white shadow-sm">
                                            {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User className="h-10 w-10" />}
                                        </div>
                                        {isEditing && (
                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera className="h-6 w-6 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Profile Picture</h3>
                                        <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                value={isEditing ? formData.name : user.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="email"
                                                disabled
                                                value={user.email}
                                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                value={isEditing ? formData.hostel : user.hostel}
                                                onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                disabled={!isEditing}
                                                value={isEditing ? formData.phone : user.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-kh-purple hover:bg-purple-700 text-white font-bold rounded-lg transition-colors shadow-md"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setIsEditing(false); setFormData(user); }}
                                            className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}

                            </form>
                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
}
