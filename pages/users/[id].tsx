import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { User, MapPin, Star, MessageCircle, ShieldCheck, Calendar } from 'lucide-react';
import ListingCard from '../../components/ListingCard';
import Link from 'next/link';

export default function UserProfile() {
    const router = useRouter();
    const { id } = router.query;

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: profile, isLoading } = useSWR(id ? `/api/users/${id}` : null, fetcher);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!profile) return <div className="min-h-screen flex items-center justify-center">User not found</div>;

    const getTrustColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-blue-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

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
                                <ShieldCheck className={`h-5 w-5 ${getTrustColor(profile.trustScore || 100)}`} />
                                Trust Score
                            </h3>

                            <div className="flex items-center justify-center mb-6">
                                <div className="relative w-32 h-32">
                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#E5E7EB"
                                            strokeWidth="3"
                                        />
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke={profile.trustScore >= 90 ? "#16A34A" : profile.trustScore >= 70 ? "#2563EB" : "#CA8A04"}
                                            strokeWidth="3"
                                            strokeDasharray={`${profile.trustScore || 100}, 100`}
                                            className="animate-[spin_1s_ease-out_reverse]"
                                        />
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                        <span className={`text-3xl font-bold ${getTrustColor(profile.trustScore || 100)}`}>
                                            {profile.trustScore || 100}
                                        </span>
                                    </div>
                                </div>
                            </div>

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

                    {/* Right: Listings & Reviews */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Active Listings */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Listings</h2>
                            {profile.listings && profile.listings.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {profile.listings.map((listing: any) => (
                                        <ListingCard key={listing.id} {...listing} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500">No active listings found.</p>
                                </div>
                            )}
                        </div>

                        {/* Reviews */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews ({profile.reviewCount || 0})</h2>
                            {profile.reviews && profile.reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {profile.reviews.map((review: any) => (
                                        <div key={review.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                        {review.reviewerAvatar ? (
                                                            <img src={review.reviewerAvatar} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            review.reviewerName?.[0]
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-gray-900 text-sm">{review.reviewerName}</span>
                                                </div>
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-3 w-3 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-200"}`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-gray-600 text-sm">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500">No reviews yet.</p>
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
