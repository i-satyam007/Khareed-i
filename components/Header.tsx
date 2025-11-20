import Link from "next/link";
import useSWR from "swr";
import { useRouter } from "next/router";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Header() {
  const { data } = useSWR("/api/auth/me", fetcher);
  const router = useRouter();
  const user = data?.user ?? null;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(()=>{});
    router.replace("/");
    window.location.href = "/";
  }

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      {/* ✅ Used container-responsive for alignment */}
      <div className="container-responsive flex items-center gap-4 py-3">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-kh-purple to-purple-400 flex items-center justify-center text-white font-bold text-xl shadow-sm">K</div>
          <div className="hidden sm:block">
            <div className="font-bold text-lg text-kh-dark leading-tight">Khareed-i</div>
            <div className="text-[10px] text-kh-gray uppercase tracking-wide">IPM Marketplace</div>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto hidden sm:block">
          <form className="flex items-center w-full bg-kh-light rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-kh-purple/20 transition-all">
            <select className="p-2.5 bg-transparent text-sm text-kh-dark border-r border-gray-200 outline-none cursor-pointer hover:bg-gray-50">
              <option>All</option>
              <option>Grocery</option>
              <option>Food</option>
              <option>Books</option>
            </select>
            <input 
              className="flex-1 p-2.5 text-sm bg-transparent outline-none placeholder-gray-400 min-w-0" 
              placeholder="Search products..." 
            />
            <button className="px-5 py-2.5 bg-kh-red text-white hover:bg-red-500 transition-colors font-medium text-sm">
              Search
            </button>
          </form>
        </div>

        {/* Nav Actions */}
        <nav className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-1">
             <Link href="/group-orders/create" className="text-sm font-medium text-kh-gray hover:text-kh-purple transition-colors px-3 py-2 rounded-md hover:bg-gray-50">Group Order</Link>
             <Link href="/listings/create" className="text-sm font-medium text-kh-gray hover:text-kh-purple transition-colors px-3 py-2 rounded-md hover:bg-gray-50">Sell</Link>
          </div>

          {/* Mobile Search Icon (visible only on small screens) */}
          <button className="sm:hidden p-2 text-kh-gray">
            🔍
          </button>

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
              <Link href="/profile" className="text-sm font-medium text-kh-dark hover:underline truncate max-w-[100px]">
                {user.name ?? user.username}
              </Link>
              <button onClick={handleLogout} className="text-xs bg-gray-100 hover:bg-gray-200 text-kh-dark px-3 py-1.5 rounded-md transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 sm:border-l border-gray-200">
               <Link href="/login" className="text-sm font-medium text-kh-dark hover:text-kh-purple px-2 hidden sm:block">Login</Link>
               <Link href="/signup" className="text-sm bg-kh-dark text-white px-4 py-2 rounded-lg hover:bg-black transition-colors shadow-sm">Sign up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}