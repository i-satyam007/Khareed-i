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
    <div className="min-h-screen flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-kh-light">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
         {/* Logo Placeholder - Replace with <img src="/logo.png" /> if you have one */}
         <div className="mx-auto h-12 w-12 bg-kh-purple rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">K</div>
         <h2 className="text-3xl font-bold text-kh-dark">Sign in to your account</h2>
         <p className="mt-2 text-sm text-kh-gray">
           Or <Link href="/signup" className="font-medium text-kh-red hover:text-red-500">create a new account</Link>
         </p>
      </div>

      <div className="auth-card sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          
          <div>
            <label className="block text-sm font-medium text-kh-gray mb-1">Email or Username</label>
            <input
              {...register("identifier", { required: "Email or username is required" })}
              className="input-field"
              placeholder="you@iimidr.ac.in"
            />
            {errors.identifier && <p className="mt-1 text-xs text-red-600">{errors.identifier.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-kh-gray mb-1">Password</label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="input-field"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            <div className="flex items-center justify-end mt-1">
              <Link href="/forgot-password" className="text-xs font-medium text-kh-purple hover:text-purple-600">Forgot password?</Link>
            </div>
          </div>

          {/* CAPTCHA */}
          <div className="flex justify-center">
             <div id="recap-login" className="scale-90 sm:scale-100 origin-center" />
          </div>

          {/* Error Messages */}
          {loginError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Login Failed</h3>
                  <div className="mt-2 text-sm text-red-700"><p>{loginError}</p></div>
                </div>
              </div>
            </div>
          )}

          {showForgotUser && (
             <div className="text-center text-sm">
                <span className="text-kh-gray">Forgotten your username? </span>
                <Link href="/forgot-username" className="font-medium text-kh-red hover:text-red-500">Recover it here</Link>
             </div>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}