// pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import "../styles/globals.css";
import Header from "../components/Header";

export default function MyApp({ Component, pageProps }: AppProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  return (
    <>
      <Head>
        <title>Khareed-i</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {siteKey && (
        <Script 
           src={`https://www.google.com/recaptcha/api.js`} 
           strategy="afterInteractive" 
        />
      )}

      <Header />

      <main className="py-8">
        <div className="container">
          <Component {...pageProps} />
        </div>
      </main>
    </>
  );
}
