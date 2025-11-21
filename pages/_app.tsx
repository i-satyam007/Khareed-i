import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router"; // ✅ Added useRouter
import "../styles/globals.css";
import Header from "../components/Header";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // ✅ Define which pages should be full-screen (No Header, No Padding)
  const isAuthPage = [
    "/login",
    "/signup",
    "/forgot-password", 
      />

      {
      isAuthPage?(
        // ✅ Auth Layout: Render component directly (Full Screen Control)
        <Component { ...pageProps } />
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
  )
}
    </>
  );
}