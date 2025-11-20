// components/Header.tsx
import Link from "next/link";
import useSWR from "swr";
import { useRouter } from "next/router";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Header() {
  const { data } = useSWR("/api/auth/me", fetcher);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(()=>{});
    // force navigation to refresh state
    router.replace("/");
    window.location.href = "/";
  }

  const user = data?.user ?? null;

  return (
    <header className="bg-white shadow-sm">
      <div className="container flex items-center justify-between py-3">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md bg-primary-purple flex items-center justify-center text-white font-bold">K</div>
          <div>
            <div className="font-bold text-neutral-dark">Khareed-i</div>
            <div className="text-xs text-neutral-gray">IPM Reselling & Group Orders</div>
          </div>
        </Link>

        <div className="flex-1 mx-6">
          <form className="flex items-center">
            <select className="p-2 border rounded-l-md">
              <option>All</option>
              <option>Grocery</option>
              <option>Electronics</option>
              <option>Books</option>
              <option>Clothing</option>
            </select>
            <input className="flex-1 p-2 border-t border-b" placeholder="Search for products, group orders..." />
            <button className="bg-primary-red px-4 py-2 rounded-r-md text-white">Search</button>
          </form>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/group-orders/create" className="text-sm hidden md:inline">Start Group Order</Link>
          <Link href="/listings/create" className="text-sm hidden md:inline">List a Product</Link>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link href="/profile" className="text-sm">Hi, {user.name ?? user.username}</Link>
              <button onClick={handleLogout} className="text-sm bg-neutral-gray px-3 py-1 rounded text-white">Logout</button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login" className="text-sm">Login</Link>
              <Link href="/signup" className="text-sm border px-3 py-1 rounded">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
