import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { User, MapPin, Star, MessageCircle, ShieldCheck } from 'lucide-react';
import ListingCard from '../../components/ListingCard';
import Link from 'next/link';

export default function UserProfile() {
    const router = useRouter();
    const { id } = router.query;

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: profile, isLoading } = useSWR(id ? `/api/users/${id}` : null, fetcher);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!profile) return <div className="min-h-screen flex items-center justify-center">User not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <Head>
                <title>{profile.name} | Khareed-i Profile</title>
            </Head>

            {/* Header / Banner */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 overflow-hidden border-4 border-white shadow-lg">
                            {profile.avatar ? (
                                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-gray-300">{profile.name?.[0]}</span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{profile.name}</h1>
                            <p className="text-gray-500">@{profile.username}</p>

                            <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-600">
                                {profile.hostel && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{profile.hostel}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span>{profile.rating || "New Seller"} ({profile.reviewCount || 0} reviews)</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Link href={`/chat?userId=${profile.id}`} className="flex items-center gap-2 px-6 py-2.5 bg-kh-purple hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-purple-900/20">
                                <MessageCircle className="h-5 w-5" />
                                Chat
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Stats & Trust */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-green-600" />
                                Trust Score
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Member Since</span>
                                    <span className="font-medium">{new Date(profile.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Successful Sales</span>
                                    <span className="font-medium">{profile.salesCount || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Verified Student</span>
                                    <span className="text-green-600 font-bold">Yes</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Listings */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">Active Listings</h2>

                        {profile.listings && profile.listings.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {profile.listings.map((listing: any) => (
                                    <ListingCard key={listing.id} {...listing} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-500">No active listings found.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
