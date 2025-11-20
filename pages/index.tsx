import Link from "next/link";
import ProductCard from "../components/ProductCard";

type GroupOrder = {
  id: number;
  platform: "Blinkit" | "BigBasket" | "Swiggy" | "Zomato" | "EatSure";
  title: string;
  cutoff: string;
  minCart: string;
  host: string;
};

const groupOrders: GroupOrder[] = [
  { id: 1, platform: "Blinkit", title: "Midnight snacks run", cutoff: "Today · 11:15 PM", minCart: "₹200 shared", host: "Aman (BH-3)" },
  { id: 2, platform: "BigBasket", title: "Weekly groceries", cutoff: "Tmrw · 9:00 PM", minCart: "₹1,000 shared", host: "Khushi (GH-2)" },
  { id: 3, platform: "Swiggy", title: "Biryani from Behrouz", cutoff: "Today · 9:30 PM", minCart: "₹500 shared", host: "Rohan (BH-5)" },
];

const sampleProducts = [
  { id: 1, title: "Scientific Calculator FX-991ES (Barely used)", price: 650, mrp: 950, negotiable: true },
  { id: 2, title: "IPM Quant Book Bundle (IMS + TIME)", price: 1200, mrp: 2200, negotiable: false },
  { id: 3, title: "Table Lamp with Study Light", price: 400, mrp: 800, negotiable: true },
  { id: 4, title: "Basic Dumbbell Set (2 x 5kg)", price: 900, mrp: 1500, negotiable: true },
];

const categories = ["Grocery", "Food", "Textbooks", "Electronics", "Room Essentials", "Clothing", "Stationery", "Sports"];

function platformColor(platform: GroupOrder["platform"]) {
  switch (platform) {
    case "Blinkit": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "BigBasket": return "bg-green-100 text-green-800 border-green-200";
    case "Swiggy": return "bg-orange-100 text-orange-800 border-orange-200";
    case "Zomato": return "bg-red-100 text-red-800 border-red-200";
    case "EatSure": return "bg-purple-100 text-purple-800 border-purple-200";
    default: return "bg-gray-100 text-gray-800";
  }
}

function GroupOrderCard({ order }: { order: GroupOrder }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${platformColor(order.platform)}`}>
          {order.platform}
        </span>
        <span className="text-[10px] text-kh-gray bg-kh-light px-2 py-0.5 rounded-full border border-gray-100">Host: {order.host}</span>
      </div>
      
      <h3 className="font-semibold text-kh-dark text-sm mb-2 line-clamp-1">{order.title}</h3>
      
      <div className="mt-auto space-y-1.5 border-t border-dashed border-gray-100 pt-3">
        <div className="flex items-center text-xs text-kh-gray gap-2">
           <span>🕒 {order.cutoff}</span>
        </div>
        <div className="flex items-center text-xs text-kh-gray gap-2">
           <span>💰 {order.minCart}</span>
        </div>
      </div>

      <Link href="/group-orders/create" className="mt-4 block w-full text-center py-2 text-xs font-semibold text-kh-purple bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-100">
        Join Order
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    // ✅ Applied container-responsive here for consistent padding
    <div className="container-responsive space-y-10 pb-16 pt-4">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a1c1e] to-[#2d3033] text-white shadow-xl ring-1 ring-black/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-[0.03] rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
        <div className="flex flex-col lg:flex-row min-h-[400px] lg:min-h-[320px]">
          {/* Left: Content */}
          <div className="p-8 lg:p-12 flex-1 flex flex-col justify-center z-10">
            <h1 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
              Resell fast.<br/>Order smart.<br/><span className="text-kh-red bg-clip-text text-transparent bg-gradient-to-r from-kh-red to-orange-400">Save together.</span>
            </h1>
            <p className="text-gray-400 mb-8 max-w-lg text-sm lg:text-base leading-relaxed">
              The exclusive marketplace for IPM students. Buy/sell campus essentials or split delivery fees on food orders to save money every day.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/listings/create" className="px-6 py-3 bg-kh-red hover:bg-red-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-red-900/20 text-sm">
                List an Item
              </Link>
              <Link href="/group-orders/create" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition-all backdrop-blur-md text-sm">
                Start Group Order
              </Link>
            </div>
          </div>

          {/* Right: Quick Links Panel (Optimized Size) */}
          <div className="lg:w-[35%] bg-white/5 backdrop-blur-md border-l border-white/5 p-6 lg:p-8 flex flex-col justify-center">
             <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Quick Actions</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {[
                  { name: "Blinkit", desc: "Late night snacks", color: "bg-yellow-400", text: "text-black" },
                  { name: "Swiggy", desc: "Dinner split", color: "bg-orange-500", text: "text-white" },
                  { name: "Zomato", desc: "Group feasts", color: "bg-red-500", text: "text-white" },
                  { name: "BigBasket", desc: "Monthly essentials", color: "bg-green-600", text: "text-white" }
                ].map(brand => (
                  <Link href="/group-orders/create" key={brand.name} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group cursor-pointer">
                     <div className={`w-10 h-10 rounded-full ${brand.color} flex items-center justify-center text-xs font-bold ${brand.text} shadow-lg group-hover:scale-110 transition-transform`}>
                        {brand.name[0]}
                     </div>
                     <div>
                       <div className="text-sm font-semibold text-white">{brand.name}</div>
                       <div className="text-[11px] text-gray-400">{brand.desc}</div>
                     </div>
                  </Link>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
          <button className="px-5 py-2 rounded-full bg-kh-dark text-white text-xs font-medium whitespace-nowrap shadow-md hover:bg-black transition-colors">All Items</button>
          {categories.map((cat) => (
            <button key={cat} className="px-5 py-2 rounded-full bg-white border border-gray-200 text-kh-gray text-xs font-medium whitespace-nowrap hover:border-kh-purple hover:text-kh-purple hover:bg-purple-50 transition-all shadow-sm">
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* LISTINGS GRID */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-kh-dark">Fresh Listings</h2>
            <p className="text-sm text-kh-gray mt-1">Latest items added by students</p>
          </div>
          <Link href="/listings" className="text-sm font-medium text-kh-purple hover:text-purple-700 hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
          {sampleProducts.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              price={p.price}
              mrp={p.mrp}
              negotiable={p.negotiable}
            />
          ))}
        </div>
      </section>

      {/* ACTIVE GROUP ORDERS */}
      <section className="bg-gradient-to-br from-kh-light to-white border border-gray-100 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
             <h2 className="text-xl font-bold text-kh-dark">Active Group Orders</h2>
             <p className="text-sm text-kh-gray">Join a cart to split fees</p>
          </div>
          <Link href="/group-orders" className="text-sm font-medium text-kh-purple hover:text-purple-700 hover:underline">View all →</Link>
        </div>
        
        {groupOrders.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-white">
            <p className="text-sm text-gray-500">No active orders right now.</p>
            <Link href="/group-orders/create" className="text-sm font-medium text-kh-red hover:underline mt-2 block">Start the first one</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupOrders.map((order) => (
              <GroupOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}