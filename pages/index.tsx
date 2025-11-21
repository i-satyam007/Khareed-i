import Head from "next/head";
import Link from "next/link";
import useSWR from 'swr';
import HeroBanner from "../components/HeroBanner";
import ListingCard from "../components/ListingCard";
import GroupOrderCard from "../components/GroupOrderCard";
import { ArrowRight, ShoppingBag, Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  // Fetch latest 4 listings for the homepage
  const { data: listings, error, isLoading } = useSWR('/api/listings', fetcher);

  // Take top 4
  const trendingListings = listings ? listings.slice(0, 4) : [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Head>
        <title>Khareed-i | IPM Reselling Marketplace</title>
        <meta name="description" content="Buy, Sell, and Group Order with Khareed-i" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-6 space-y-10">

        {/* Hero Section */}
        <HeroBanner />

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
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 text-kh-purple animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">Failed to load listings.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingListings.map((item: any) => (
                <ListingCard key={item.id} {...item} />
              ))}
            </div>
          )}
        </section>

        {/* Active Group Orders (Still Mock for now, can be updated later) */}
        <section className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Active Group Orders</h2>
              <p className="text-sm text-gray-500">Join a cart to split fees</p>
            </div>
            <Link href="/group-orders" className="text-sm font-medium text-kh-purple hover:text-purple-700 hover:underline">View all →</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 1, platform: "Blinkit", title: "Midnight snacks run", cutoff: "Today · 11:15 PM", minCart: "₹200 shared", host: "Aman (BH-3)" },
              { id: 2, platform: "BigBasket", title: "Weekly groceries", cutoff: "Tmrw · 9:00 PM", minCart: "₹1,000 shared", host: "Khushi (GH-2)" },
              { id: 3, platform: "Swiggy", title: "Biryani from Behrouz", cutoff: "Today · 9:30 PM", minCart: "₹500 shared", host: "Rohan (BH-5)" },
            ].map((order) => (
              // @ts-ignore
              <GroupOrderCard key={order.id} {...order} />
            ))}
          </div>
        </section>

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

      </main>
    </div>
  );
}