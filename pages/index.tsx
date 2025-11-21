import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import HeroBanner from "../components/HeroBanner";
import ListingCard from "../components/ListingCard";
import GroupOrderCard from "../components/GroupOrderCard";
import { ArrowRight, ShoppingBag } from "lucide-react";

// Mock Data
const TRENDING_LISTINGS = [
  { id: 1, title: "Scientific Calculator FX-991ES (Barely used)", price: 650, mrp: 950, negotiable: true },
  { id: 2, title: "IPM Quant Book Bundle (IMS + TIME)", price: 1200, mrp: 2200, negotiable: false },
  { id: 3, title: "Table Lamp with Study Light", price: 400, mrp: 800, negotiable: true },
  { id: 4, title: "Basic Dumbbell Set (2 x 5kg)", price: 900, mrp: 1500, negotiable: true },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Head>
        <title>Khareed-i | IPM Reselling Marketplace</title>
        <meta name="description" content="Buy, Sell, and Group Order with Khareed-i" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {TRENDING_LISTINGS.map((item) => (
              <ListingCard key={item.id} {...item} />
            ))}
          </div>
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

        {/* Categories Grid (Optional) */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {["Electronics", "Books", "Hostel", "Clothing", "Sports", "Stationery"].map((cat) => (
              <Link href={`/listings?category=${cat}`} key={cat} className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-kh-purple hover:shadow-md transition-all group">
                <div className="text-sm font-medium text-gray-700 group-hover:text-kh-purple">{cat}</div>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}