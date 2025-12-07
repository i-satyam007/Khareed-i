import Head from "next/head";
import Link from "next/link";
import useSWR from 'swr';
import HeroBanner from "../components/HeroBanner";
import ListingCard from "../components/ListingCard";
import GroupOrderCard from "../components/GroupOrderCard";
import Skeleton, { SkeletonCircle } from "../components/Skeleton";
import { ArrowRight, ShoppingBag } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  // Fetch latest 4 listings for the homepage
  const { data: listings, error, isLoading } = useSWR('/api/listings', fetcher);

  // Fetch active group orders
  const { data: groupOrders, isLoading: isGroupOrdersLoading } = useSWR('/api/group-orders', fetcher);
  const activeGroupOrders = Array.isArray(groupOrders) ? groupOrders.slice(0, 3) : [];

  // Take top 4
  const trendingListings = Array.isArray(listings) ? listings.slice(0, 4) : [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Head>
        <title>Khareed-i | IPM Reselling Marketplace</title>
        <meta name="description" content="Buy, Sell, and Group Order with Khareed-i" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-6 space-y-10">

        {/* Hero Section */}
        <HeroBanner groupOrderCount={activeGroupOrders.length} />

        {/* Categories Grid */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {["Electronics", "Books", "Hostel Essentials", "Clothing", "Sports Gear", "Stationery"].map((cat) => (
              <Link href={`/listings?category=${encodeURIComponent(cat)}`} key={cat} className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-kh-purple hover:shadow-md transition-all group">
                <div className="text-sm font-medium text-gray-700 group-hover:text-kh-purple">{cat}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Listings */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-kh-red" />
                Fresh Listings
              </h2>
              <p className="text-sm text-gray-500 mt-1">Latest items added by students</p>
            </div>
            <Link href="/listings" className="text-sm font-medium text-kh-purple hover:text-purple-700 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden h-full">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex justify-between items-center pt-2">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">Failed to load listings.</div>
          ) : trendingListings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingListings.map((item: any) => (
                <ListingCard key={item.id} {...item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No active listings found. <Link href="/listings/create" className="text-kh-purple font-bold hover:underline">Be the first to list!</Link>
            </div>
          )}
        </section>

        {/* Active Group Orders */}
        <section className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Active Group Orders</h2>
              <p className="text-sm text-gray-500">Join a cart to split fees</p>
            </div>
            <Link href="/group-orders" className="text-sm font-medium text-kh-purple hover:text-purple-700 hover:underline">View all →</Link>
          </div>

          {isGroupOrdersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <SkeletonCircle className="w-10 h-10" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-1/3 rounded-full" />
                    <Skeleton className="h-8 w-1/3 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeGroupOrders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeGroupOrders.map((order: any) => (
                <GroupOrderCard
                  key={order.id}
                  id={order.id}
                  platform={order.platform}
                  title={order.title}
                  cutoff={new Date(order.cutoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  minCart={order.minOrderValue ? `Min ₹${order.minOrderValue}` : "No min"}
                  host={`${order.creator?.name} (${order.creator?.hostel || 'Unknown'})`}
                  hostAvatar={order.creator?.avatar}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No active group orders. <Link href="/group-orders/create" className="text-kh-purple font-bold hover:underline">Start one?</Link>
            </div>
          )}
        </section>



      </main>
    </div>
  );
}