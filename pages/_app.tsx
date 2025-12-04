import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import { Search, ShoppingCart, User, Menu, ChevronDown, Users, ShoppingBag, Bell, X, CheckCircle, AlertCircle, Info, Heart, Shield, BadgeCheck, MessageCircle } from 'lucide-react';
import "../styles/globals.css";
import Header from "../components/Header";
import ChatWidget from "../components/ChatWidget";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // ✅ Define which pages should be full-screen (No Header, No Padding)
  const isAuthPage = [
    "/login",
    "/signup",
    "/forgot-password"
  ].includes(router.pathname);

  return (
    <>
      <Head>
        <link rel="icon" href="/Logo.svg" type="image/svg+xml" />
        <title>Khareed-i - IPM Marketplace</title>
        <meta name="description" content="Buy, Sell, and Group Order with Khareed-i - The exclusive marketplace for IPM students." />
      </Head>

      {/* ✅ Restore reCAPTCHA Script */}
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=explicit`}
        strategy="lazyOnload"
      />

      {isAuthPage ? (
        // ✅ Auth Layout: Render component directly (Full Screen Control)
        <Component {...pageProps} />
      ) : (
        // ✅ Standard Layout: Header + Padding + Container
        <>
          <Header />
          <main className="py-8">
            {/* Chat Icon */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative outline-none text-gray-700 hover:text-kh-purple fixed bottom-20 right-4 md:hidden z-40 bg-white shadow-lg border border-gray-200"
              title="Chats"
            >
              <MessageCircle className="h-6 w-6" />
            </button>

            {/* Using container-responsive to match the Header alignment */}
            <div className="container-responsive">
              <Component {...pageProps} />
            </div>
          </main>
        </>
      )}
      <Toaster position="top-center" />
      <ChatWidget />
    </>
  );
}