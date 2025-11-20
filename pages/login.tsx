// pages/login.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { mutate } from "swr"; // ✅ Import mutate

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

      // ✅ FORCE UPDATE THE HEADER BEFORE REDIRECTING
      await mutate("/api/auth/me");

      router.replace("/");
    } catch (err) {
      setLoginError("Network error");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* identifier */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Email or Username</label>
          <input
            {...register("identifier", { required: "Enter email or username" })}
            placeholder="Email or username"
            className="border border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-600"
            autoComplete="username"
          />
          {errors.identifier && (
            <div className="text-sm text-red-600 mt-1">{errors.identifier.message}</div>
          )}
        </div>

        {/* password */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Password</label>
          <input
            {...register("password", { required: "Enter password" })}
            placeholder="Password"
            type="password"
            className="border border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-600"
            autoComplete="current-password"
          />
          {errors.password && (
            <div className="text-sm text-red-600 mt-1">{errors.password.message}</div>
          )}
           <div className="text-right mt-1">
            <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        {/* reCAPTCHA widget */}
        <div className="mt-2">
          <div id="recap-login" />
        </div>

        {/* Server Error Display */}
        {loginError && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
            {loginError}
          </div>
        )}

        {showForgotUser && (
          <div className="text-center text-sm">
             <span className="text-gray-600">Trouble signing in? </span>
             <Link href="/forgot-username" className="text-orange-600 font-medium hover:underline">
               Forgot Username?
             </Link>
          </div>
        )}

        {/* submit */}
        <button
          className="w-full bg-orange-600 hover:bg-orange-700 text-white p-2 rounded disabled:opacity-60 font-semibold"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}