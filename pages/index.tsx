// pages/index.tsx
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
  {
    id: 1,
    platform: "Blinkit",
    title: "Midnight snacks run",
    cutoff: "Today · 11:15 PM",
    minCart: "₹200 shared",
    host: "Aman (BH-3)",
  },
  {
    id: 2,
    platform: "BigBasket",
    title: "Weekly groceries bulk order",
    cutoff: "Tomorrow · 9:00 PM",
    minCart: "₹1,000 shared",
    host: "Khushi (GH-2)",
  },
  {
    id: 3,
    platform: "Swiggy",
    title: "Biryani from Behrouz",
    cutoff: "Today · 9:30 PM",
    minCart: "₹500 shared",
    host: "Rohan (BH-5)",
  },
];

const sampleProducts = [
  {
    id: 1,
    title: "Scientific Calculator FX-991ES (Barely used)",
    price: 650,
    mrp: 950,
    negotiable: true,
  },
  {
    id: 2,
    title: "IPM Quant Book Bundle (IMS + TIME)",
    price: 1200,
    mrp: 2200,
    negotiable: false,
  },
  {
    id: 3,
    title: "Table Lamp with Study Light",
    price: 400,
    mrp: 800,
    negotiable: true,
  },
  {
    id: 4,
    title: "Basic Dumbbell Set (2 x 5kg)",
    price: 900,
    mrp: 1500,
    negotiable: true,
  },
];

const categories = [
  "All",
  "Grocery",
  "Food & Beverages",
  "Textbooks",
  "Electronics",
  "Room Essentials",
  "Clothing",
  "Stationery",
  "Sports & Fitness",
];

function platformColor(platform: GroupOrder["platform"]) {
  switch (platform) {
    case "Blinkit":
      return "bg-[#FFE082] text-black";
    case "BigBasket":
      return "bg-[#C8E6C9] text-black";
    case "Swiggy":
      return "bg-[#FFCCBC] text-black";
    case "Zomato":
      return "bg-[#FFCDD2] text-black";
    case "EatSure":
      return "bg-[#D1C4E9] text-black";
    default:
      return "bg-ui-highlight text-neutral-dark";
  }
}

function GroupOrderCard({ order }: { order: GroupOrder }) {
  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span
          className={
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium " +
            platformColor(order.platform)
          }
        >
          {order.platform}
        </span>
        <span className="text-xs text-neutral-muted">Host: {order.host}</span>
      </div>
      <div>
        <div className="font-semibold text-sm text-neutral-dark">
          {order.title}
        </div>
        <div className="text-xs text-neutral-muted mt-1">
          Cutoff: {order.cutoff}
        </div>
        <div className="text-xs text-neutral-muted">
          Min cart: {order.minCart}
        </div>
      </div>
      <div className="flex justify-between items-center pt-1">
        <span className="text-xs text-green-700">
          Prepaid · Split by weighted share
        </span>
        <Link
          href="/group-orders/create"
          className="text-xs text-primary-purple"
        >
          Join / View
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero + group-order platforms */}
      <section className="hero rounded-xl py-6 px-4 md:px-6 shadow-card">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-stretch">
          {/* Left: main hero message */}
          <div className="flex-1 flex flex-col gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-dark">
              Khareed-i: Resell fast. Order smart. Save together.
            </h1>
            <p className="text-neutral-muted max-w-xl text-sm md:text-base">
              List unused items, grab seniors&apos; stuff at a discount, or start
              a group order on Blinkit, BigBasket, Swiggy, Zomato, or EatSure to
              dodge small-cart charges.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/listings/create"
                className="px-4 py-2 rounded-md-lg bg-primary-red text-white text-sm font-medium shadow-sm"
              >
                List a product
              </Link>
              <Link
                href="/group-orders/create"
                className="px-4 py-2 rounded-md-lg border border-primary-purple text-sm font-medium"
              >
                Start a group order
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-neutral-muted">
              <span className="px-2 py-1 bg-ui-highlight rounded-full">
                🔁 Peer-to-peer resell
              </span>
              <span className="px-2 py-1 bg-ui-highlight rounded-full">
                🛒 Shared carts for groceries & food
              </span>
              <span className="px-2 py-1 bg-ui-highlight rounded-full">
                💸 Escrow-style prepaid safety
              </span>
            </div>
          </div>

          {/* Right: platform cards */}
          <div className="w-full md:w-80 space-y-3">
            <h2 className="text-sm font-semibold text-neutral-dark">
              Start a group order from
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="card flex flex-col gap-1">
                <div className="font-semibold">Blinkit</div>
                <div className="text-neutral-muted">
                  Late-night snacks, drinks, quick groceries.
                </div>
              </div>
              <div className="card flex flex-col gap-1">
                <div className="font-semibold">BigBasket</div>
                <div className="text-neutral-muted">
                  Weekly hostel groceries and bulk items.
                </div>
              </div>
              <div className="card flex flex-col gap-1">
                <div className="font-semibold">Swiggy</div>
                <div className="text-neutral-muted">
                  Combine restaurant orders to save fees.
                </div>
              </div>
              <div className="card flex flex-col gap-1">
                <div className="font-semibold">Zomato & EatSure</div>
                <div className="text-neutral-muted">
                  Group food orders with coupon optimization.
                </div>
              </div>
            </div>
            <p className="text-[11px] text-neutral-muted">
              The lister places the order; payments stay in Khareed-i until the
              order is confirmed.
            </p>
          </div>
        </div>
      </section>

      {/* Category pill bar */}
      <section className="-mx-4 md:mx-0">
        <div className="overflow-x-auto">
          <div className="flex gap-2 px-4 md:px-0 pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-3 py-1 rounded-full border bg-white text-xs whitespace-nowrap hover:bg-primary-purple hover:text-white transition"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resell listings */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-dark">
            Latest resell listings
          </h2>
          <Link href="/listings" className="text-sm text-primary-purple">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

      {/* Active group orders */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-dark">
            Active group orders
          </h2>
          <Link href="/group-orders" className="text-sm text-primary-purple">
            View all
          </Link>
        </div>

        {groupOrders.length === 0 ? (
          <div className="card text-sm text-neutral-muted">
            No live group orders right now. Be the first to{" "}
            <Link href="/group-orders/create" className="text-primary-purple">
              start one
            </Link>
            .
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {groupOrders.map((order) => (
              <GroupOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
