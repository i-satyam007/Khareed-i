import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { LayoutDashboard, Users, Package, AlertTriangle, Shield, LogOut, Check, X, Search, Trash2, Eye } from 'lucide-react';
import useSWR from 'swr';
import { useUser } from '@/lib/hooks/useUser';

// Fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
    const { user, loading, loggedOut } = useUser();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!loading && (loggedOut || user?.role !== 'admin')) {
            router.replace('/login');
        }
    }, [user, loading, loggedOut]);

    if (loading || !user || user.role !== 'admin') {
        return <div className="min-h-screen flex items-center justify-center">Loading Admin Dashboard...</div>;
    }

    return (
        <div className="min-h-screen bg-kh-light font-sans flex">
            <Head>
                <title>Admin Dashboard | Khareed-i</title>
            </Head>

            {/* Sidebar */}
            <aside className="w-64 bg-black/40 backdrop-blur-md border-r border-white/10 text-white flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-xl font-bold tracking-tight">Khareed-i Admin</h1>
                    <p className="text-xs text-gray-400 mt-1">Super Admin Console</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <SidebarItem icon={<LayoutDashboard />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <SidebarItem icon={<Package />} label="Listings" active={activeTab === 'listings'} onClick={() => setActiveTab('listings')} />
                    <SidebarItem icon={<Users />} label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                    <SidebarItem icon={<Shield />} label="Blacklisted" active={false} onClick={() => router.push('/admin/blacklisted')} />
                    <SidebarItem icon={<AlertTriangle />} label="Suspicious Activity" active={activeTab === 'suspicious'} onClick={() => setActiveTab('suspicious')} />
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors cursor-pointer" onClick={() => router.push('/')}>
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Exit Dashboard</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen">
                <div className="p-8">
                    {activeTab === 'overview' && <OverviewTab />}
                    {activeTab === 'listings' && <ListingsTab />}
                    {activeTab === 'users' && <UsersTab />}
                    {activeTab === 'suspicious' && <SuspiciousTab />}
                </div>
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-kh-purple text-white shadow-lg shadow-purple-900/20' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
        >
            {React.cloneElement(icon, { className: "h-5 w-5" })}
            <span className="font-medium">{label}</span>
        </button>
    );
}

// --- TABS ---

function OverviewTab() {
    const { data: stats } = useSWR('/api/admin/stats', fetcher);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={<Users className="text-blue-500" />} />
                <StatCard title="Active Listings" value={stats?.activeListings || 0} icon={<Package className="text-green-500" />} />
                <StatCard title="Pending Approvals" value={stats?.pendingListings || 0} icon={<AlertTriangle className="text-orange-500" />} />
            </div>

            {/* Recent Activity or Charts could go here */}
        </div>
    );
}

function StatCard({ title, value, icon }: any) {
    return (
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/10 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-400">{title}</p>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">{React.cloneElement(icon, { className: "h-8 w-8" })}</div>
        </div>
    );
}

function ListingsTab() {
    const { data: listings, mutate } = useSWR('/api/admin/listings', fetcher);
    const [search, setSearch] = useState("");

    const handleAction = async (id: number, action: 'approve' | 'delete') => {
        if (!confirm(`Are you sure you want to ${action} this listing?`)) return;
        await fetch(`/api/admin/listings?id=${id}&action=${action}`, { method: 'PUT' });
        mutate();
    };

    const filtered = listings?.filter((l: any) => l.title.toLowerCase().includes(search.toLowerCase())) || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Manage Listings</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search listings..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-black/20 border border-white/10 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-kh-purple/20"
                    />
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10 text-gray-400">
                        <tr>
                            <th className="px-6 py-4 font-medium">Title</th>
                            <th className="px-6 py-4 font-medium">Seller</th>
                            <th className="px-6 py-4 font-medium">Price</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {filtered.map((listing: any) => (
                            <tr key={listing.id} className="hover:bg-white/5">
                                <td className="px-6 py-4 font-medium text-white">{listing.title}</td>
                                <td className="px-6 py-4 text-gray-400">{listing.owner?.name}</td>
                                <td className="px-6 py-4 text-white">₹{listing.price}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${listing.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-gray-400'}`}>
                                        {listing.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => window.open(`/listings/${listing.id}`, '_blank')} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Eye className="h-4 w-4" /></button>
                                    <button onClick={() => handleAction(listing.id, 'delete')} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function UsersTab() {
    const [sort, setSort] = useState('createdAt');
    const [order, setOrder] = useState('desc');
    const { data: users, mutate } = useSWR(`/api/admin/users?sort=${sort}&order=${order}`, fetcher);
    const [search, setSearch] = useState("");

    const handleBanAction = async (id: number, isBanned: boolean) => {
        const action = isBanned ? 'unban' : 'ban';
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;
        await fetch(`/api/admin/users?id=${id}&action=${action}`, { method: 'PUT' });
        mutate();
    };

    const filtered = users?.filter((u: any) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search)) || [];

    const toggleSort = (field: string) => {
        if (sort === field) {
            setOrder(order === 'asc' ? 'desc' : 'asc');
        } else {
            setSort(field);
            setOrder('asc');
        }
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sort !== field) return <div className="w-4 h-4 inline-block" />;
        return order === 'asc' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Manage Users</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-black/20 border border-white/10 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-kh-purple/20"
                    />
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10 text-gray-400">
                        <tr>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-white/10" onClick={() => toggleSort('name')}>
                                User <SortIcon field="name" />
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-white/10" onClick={() => toggleSort('email')}>
                                Email <SortIcon field="email" />
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-white/10" onClick={() => toggleSort('role')}>
                                Role <SortIcon field="role" />
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-white/10" onClick={() => toggleSort('failedPaymentCount')}>
                                Trust Score <SortIcon field="failedPaymentCount" />
                            </th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {filtered.map((u: any) => {
                            const isBanned = u.blacklistUntil && new Date(u.blacklistUntil) > new Date();
                            return (
                                <tr key={u.id} className={`hover:bg-white/5 ${isBanned ? 'bg-red-500/10' : ''}`}>
                                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-gray-400">
                                            {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-full object-cover" /> : u.name?.[0]}
                                        </div>
                                        <div>
                                            <p>{u.name}</p>
                                            {isBanned && <span className="text-[10px] text-red-600 font-bold uppercase">Banned</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{u.email}</td>
                                    <td className="px-6 py-4 text-gray-400 capitalize">{u.role}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <div className={`h-2 w-2 rounded-full ${u.failedPaymentCount > 2 ? 'bg-red-500' : 'bg-green-500'}`} />
                                            <span className="text-gray-300">{Math.max(0, 100 - (u.failedPaymentCount * 10))}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {u.role !== 'admin' && (
                                            <button
                                                onClick={() => handleBanAction(u.id, isBanned)}
                                                className={`font-medium text-xs px-3 py-1 rounded-lg transition-colors ${isBanned ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                                            >
                                                {isBanned ? 'Unban User' : 'Ban User'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SuspiciousTab() {
    const { data: users } = useSWR('/api/admin/users', fetcher);
    const suspiciousUsers = users?.filter((u: any) => u.failedPaymentCount > 0) || [];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Suspicious Activity Monitor</h2>

            {suspiciousUsers.length === 0 ? (
                <div className="p-8 text-center bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-gray-400">
                    <Shield className="h-12 w-12 mx-auto text-green-500 mb-3" />
                    <h3 className="font-bold text-white">All Clear!</h3>
                    <p>No suspicious activity detected recently.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {suspiciousUsers.map((u: any) => (
                        <div key={u.id} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <AlertTriangle className="h-6 w-6 text-red-500" />
                                <div>
                                    <h3 className="font-bold text-white">{u.name} (@{u.username})</h3>
                                    <p className="text-sm text-red-400">Flagged for {u.failedPaymentCount} failed payments/reports.</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white/5 border border-red-500/20 text-red-400 font-bold rounded-lg hover:bg-red-500/10 text-sm">
                                Review Profile
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
