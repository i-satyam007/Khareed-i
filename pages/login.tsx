import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Link from "next/link";
import { mutate } from "swr";

declare global {
  interface Window {
    grecaptcha?: any;
  }
}

declare const grecaptcha: any;

function useRenderRecaptcha(elementId: string, siteKey: string | undefined) {
  const widgetRef = useRef<number | null>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    const tryRender = () => {
      if (cancelled) return;
      const g = (window as any).grecaptcha;
      const el = document.getElementById(elementId);
      if (g && el) {
        try {
          if (renderedRef.current && typeof g.reset === "function") {
             g.reset(widgetRef.current);
          } else {
            const wid = g.render(elementId, { sitekey: siteKey });
            widgetRef.current = wid;
            renderedRef.current = true;
          }
        } catch (err) {
           setTimeout(tryRender, 200);
        }
        return;
      }
      setTimeout(tryRender, 200);
    };
    tryRender();
    return () => {
      cancelled = true;
    };
  }, [elementId, siteKey]);
  return widgetRef;
}

type FormData = { identifier: string; password: string; };

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const router = useRouter();
  const [loginError, setLoginError] = useState("");
  const [showForgotUser, setShowForgotUser] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const widgetRef = useRenderRecaptcha("recap-login", siteKey);

  const onSubmit = async (data: FormData) => {
    setLoginError("");
    setShowForgotUser(false);

    try {
      let captchaToken: string | undefined = undefined;
      if (typeof window !== "undefined" && (window as any).grecaptcha) {
        const wid = widgetRef.current;
        captchaToken = (window as any).grecaptcha.getResponse(
          typeof wid === "number" ? wid : undefined
        );
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, captchaToken }),
      });
      const j = await res.json();
      
      if (!res.ok) {
        setLoginError(j?.error || "Login failed");
        if (res.status === 401 || j?.error?.includes("Invalid")) {
          setShowForgotUser(true);
        }
        if ((window as any).grecaptcha) {
          try {
            const wid = widgetRef.current;
            (window as any).grecaptcha.reset(typeof wid === "number" ? wid : undefined);
          } catch (e) {}
        }
        return;
      }

      await mutate("/api/auth/me");
      router.replace("/");
    } catch (err) {
      setLoginError("Network error");
    }
  };

  return (
    // ✅ FIXED LAYOUT: h-screen + center alignment
    <div className="h-screen w-full flex items-center justify-center bg-kh-light overflow-hidden">
      
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 mx-4">
         {/* Logo */}
         <div className="text-center mb-8">
           <div className="mx-auto h-12 w-12 bg-gradient-to-br from-kh-purple to-purple-400 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">K</div>
           <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
           <p className="mt-2 text-sm text-gray-500">
             New here? <Link href="/signup" className="font-semibold text-kh-red hover:text-red-600 transition-colors">Create an account</Link>
           </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Email or Username</label>
            <input
              {...register("identifier", { required: "Email or username is required" })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple transition-all"
              placeholder="you@iimidr.ac.in"
            />
            {errors.identifier && <p className="mt-1 text-xs text-red-500 font-medium">{errors.identifier.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Password</label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>}
            <div className="flex items-center justify-end mt-2">
              <Link href="/forgot-password" className="text-xs font-medium text-kh-purple hover:text-purple-600 hover:underline">Forgot password?</Link>
            </div>
          </div>

          {/* CAPTCHA - Centered */}
          <div className="flex justify-center">
             <div id="recap-login" className="scale-90 origin-center" />
          </div>

          {/* Error Messages */}
          {loginError && (
            <div className="rounded-lg bg-red-50 p-3 border border-red-100">
              <div className="flex items-center gap-2 text-sm text-red-700">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                <p className="font-medium">{loginError}</p>
              </div>
            </div>
          )}

          {showForgotUser && (
             <div className="text-center text-sm p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <span className="text-gray-600">Forgot username? </span>
                <Link href="/forgot-username" className="font-semibold text-kh-red hover:text-red-600 hover:underline">Recover it here</Link>
             </div>
          )}

          {/* Button - Explicitly Styled */}
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-kh-red hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kh-red disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Signing in...
              </span>
            ) : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}