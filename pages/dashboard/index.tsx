import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Head from 'next/head';
import Link from 'next/link';
import ImageCropper from '../../components/ImageCropper';
import { useRouter } from 'next/router';
import { User, MapPin, Phone, Mail, Package, ShoppingBag, LogOut, Camera, Heart, Shield, BadgeCheck } from 'lucide-react';
import { useUser } from '@/lib/hooks/useUser';
import useSWR from 'swr';
import ListingCard from '@/components/ListingCard';

export default function DashboardProfile() {
    const { user, mutate } = useUser();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [activeTab, setActiveTab] = useState('profile');
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

    useEffect(() => {
        if (router.query.tab) {
            setActiveTab(router.query.tab as string);
        }
    }, [router.query.tab]);

    // Fetch Watchlist
    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: watchlist = [] } = useSWR(user ? `/api/users/watchlist` : null, fetcher);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                hostel: user.hostel || '',
                phone: user.phone || '',
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/users/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const updatedUser = await res.json();
                mutate(updatedUser);
                setIsEditing(false);
                toast.success("Profile updated successfully!");
            } else {
                toast.error("Failed to update profile");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        }
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCropImageSrc(reader.result as string);
            });
            reader.readAsDataURL(file);
            // Reset input so same file can be selected again
            e.target.value = '';
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setCropImageSrc(null); // Close cropper

        const data = new FormData();
        data.append('file', croppedBlob, 'profile.jpg');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data
            });
            if (res.ok) {
                const { url } = await res.json();
                setFormData({ ...formData, avatar: url });
                toast.success('Profile photo updated!');
            } else {
                const err = await res.json();
                toast.error(`Upload failed: ${err.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            toast.error('Upload error');
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head>
                <title>My Profile | Khareed-i</title>
            </Head>

            {cropImageSrc && (
                <ImageCropper
                    imageSrc={cropImageSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setCropImageSrc(null)}
                />
            )}

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                            <div className="p-6 bg-kh-purple/5 border-b border-gray-100 text-center rounded-t-2xl">
                                <div className="w-20 h-20 bg-kh-purple/20 rounded-full flex items-center justify-center text-2xl font-bold text-kh-purple mx-auto mb-3 overflow-hidden">
                                    {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user.name?.[0]}
                                </div>
                                <div className="flex items-center justify-center gap-1">
                                    <h2 className="font-bold text-gray-900">{user.name}</h2>
                                    {(user.isVerifiedStudent || user.email?.endsWith('@iimidr.ac.in')) && (
                                        <div className="relative group/verified">
                                            <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-500 text-white" />
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/verified:block w-max px-2 py-1 bg-gray-800 text-white text-[10px] rounded shadow-lg z-50 whitespace-nowrap">
                                                Verified IIM Indore Student
                                                <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">@{user.username}</p>
                            </div>

                            <nav className="p-2 space-y-1">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-purple-50 text-kh-purple' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <User className="h-5 w-5" /> My Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab('watchlist')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${activeTab === 'watchlist' ? 'bg-purple-50 text-kh-purple' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <Heart className="h-5 w-5" /> My Watchlist
                                </button>

                                {user.role === 'admin' && (
                                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold rounded-xl transition-colors">
                                        <Shield className="h-5 w-5" /> Admin Dashboard
                                    </Link>
                                )}

                                <Link href="/dashboard/my-listings" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-xl transition-colors">
                                    <Package className="h-5 w-5" /> My Listings
                                </Link>
                                <Link href="/dashboard/my-orders" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-xl transition-colors">
                                    <ShoppingBag className="h-5 w-5" /> My Orders
                                </Link>
                                <Link href="/api/auth/logout" className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors mt-2">
                                    <LogOut className="h-5 w-5" /> Sign Out
                                </Link>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {activeTab === 'profile' && (
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

                                    {/* Avatar Upload */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative group cursor-pointer" onClick={() => isEditing && document.getElementById('avatar-upload')?.click()}>
                                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 overflow-hidden border-2 border-white shadow-sm">
                                                {formData.avatar ? <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User className="h-10 w-10" />}
                                            </div>
                                            {isEditing && (
                                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Camera className="h-6 w-6 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={onFileChange}
                                        />
                                        <div>
                                            <h3 className="font-bold text-gray-900">Profile Picture</h3>
                                            <p className="text-xs text-gray-500">PNG, JPG up to 4MB</p>
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
                                                    value={formData.name}
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
                                                    value={formData.hostel}
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
                                                    value={formData.phone}
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
                                                onClick={() => { setIsEditing(false); setFormData({ name: user.name, hostel: user.hostel, phone: user.phone, avatar: user.avatar }); }}
                                                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}

                                </form>
                            </div>
                        )}

                        {activeTab === 'watchlist' && (
                            <div className="space-y-6">
                                <h1 className="text-2xl font-bold text-gray-900">My Watchlist</h1>
                                {watchlist.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {watchlist.map((listing: any) => (
                                            <ListingCard key={listing.id} {...listing} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Heart className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Your watchlist is empty</h3>
                                        <p className="text-gray-500 text-sm mt-1">Save items you're interested in to view them here.</p>
                                        <Link href="/listings" className="inline-block mt-4 px-6 py-2 bg-kh-purple text-white font-bold rounded-lg hover:bg-purple-700 transition-colors">
                                            Browse Listings
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>

                </div>
            </div>
        </div>
    );
}
