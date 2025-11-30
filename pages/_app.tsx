import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";
import Header from "../components/Header";
import ClickSpark from "../components/ClickSpark";
import ShinyText from "../components/ShinyText";
import { useEffect, useState } from "react";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

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

      <ClickSpark />

      {/* ✅ Restore reCAPTCHA Script */}
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=explicit`}
        strategy="lazyOnload"
      />

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-kh-light/80 backdrop-blur-sm">
          <ShinyText text="Loading..." className="text-4xl" />
        </div>
      )}

      {isAuthPage ? (
        // ✅ Auth Layout: Render component directly (Full Screen Control)
        <Component {...pageProps} />
      ) : (
        // ✅ Standard Layout: Header + Padding + Container
        <>
          <Header />
          <main className="py-8">
            {/* Using container-responsive to match the Header alignment */}
            <div className="container-responsive">
              <Component {...pageProps} />
            </div>
          </main>
        </>
      )}
      <Toaster position="top-center" />
    </>
  );
}