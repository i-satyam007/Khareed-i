import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { LayoutDashboard, Users, Package, AlertTriangle, Shield, LogOut, Search, ArrowLeft } from 'lucide-react';
import useSWR from 'swr';
import { useUser } from '@/lib/hooks/useUser';
import Link from 'next/link';

// Fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BlacklistedUsers() {
    const { user, loading, loggedOut } = useUser();
    const router = useRouter();
    const { data: users, mutate } = useSWR('/api/admin/users', fetcher);
    const [search, setSearch] = useState("");

    if (loading || !user || user.role !== 'admin') {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    // Filter for blacklisted or high-risk users
    const blacklistedUsers = users?.filter((u: any) => {
        const isBanned = u.blacklistUntil && new Date(u.blacklistUntil) > new Date();
        const isHighRisk = u.failedPaymentCount > 0;
        const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search);
        return (isBanned || isHighRisk) && matchesSearch;
    }) || [];

    const handleUnban = async (id: number) => {
        if (!confirm("Are you sure you want to unban this user?")) return;
        await fetch(`/api/admin/users?id=${id}&action=unban`, { method: 'PUT' });
        mutate();
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex">
            <Head>
                <title>Blacklisted Users | Khareed-i Admin</title>
            </Head>

            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-xl font-bold tracking-tight">Khareed-i Admin</h1>
                    <p className="text-xs text-gray-400 mt-1">Super Admin Console</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Back to Dashboard</span>
                    </Link>
                    <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider mt-4">
                        Risk Management
                    </div>
                    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-900/20 text-red-400 border border-red-900/50">
                        <Shield className="h-5 w-5" />
                        <span className="font-medium">Blacklisted Users</span>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Blacklisted & High Risk Users</h1>
                            <p className="text-gray-500 text-sm mt-1">Manage users with payment failures or active bans.</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kh-purple/20 w-64"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium">User</th>
                                    <th className="px-6 py-4 font-medium">Risk Level</th>
                                    <th className="px-6 py-4 font-medium">Reason</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {blacklistedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <Shield className="h-12 w-12 mx-auto text-green-500 mb-3" />
                                            <p className="font-medium">No blacklisted or high-risk users found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    blacklistedUsers.map((u: any) => {
                                        const isBanned = u.blacklistUntil && new Date(u.blacklistUntil) > new Date();
                                        const riskLevel = isBanned ? 'Critical' : (u.failedPaymentCount >= 3 ? 'High' : 'Warning');
                                        const riskColor = isBanned ? 'bg-red-100 text-red-700' : (u.failedPaymentCount >= 3 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700');

                                        return (
                                            <tr key={u.id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                        {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-full object-cover" /> : u.name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p>{u.name}</p>
                                                        <p className="text-xs text-gray-500">{u.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${riskColor}`}>
                                                        {riskLevel}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {isBanned ? 'Account Banned' : `${u.failedPaymentCount} Failed Payments`}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isBanned ? (
                                                        <span className="text-red-600 font-bold text-xs">Banned until {new Date(u.blacklistUntil).toLocaleDateString()}</span>
                                                    ) : (
                                                        <span className="text-green-600 font-bold text-xs">Active</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {isBanned && (
                                                        <button
                                                            onClick={() => handleUnban(u.id)}
                                                            className="text-green-600 hover:text-green-700 font-medium text-xs bg-green-50 px-3 py-1.5 rounded-lg border border-green-100"
                                                        >
                                                            Unban User
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
