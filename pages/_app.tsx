import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";
import Header from "../components/Header";

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