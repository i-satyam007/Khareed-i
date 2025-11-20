import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "../lib/validators";
import { useRouter } from "next/router";
// @ts-ignore
import zxcvbn from "zxcvbn";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

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

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const password = watch("password") || "";
  const strength = (typeof window !== "undefined" && zxcvbn) ? zxcvbn(password) : { score: 0 };
  const score = Math.min(Math.max(strength.score ?? 0, 0), 4);
  
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabel = ["Weak", "Fair", "Good", "Strong", "Excellent"][score];

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const widgetRef = useRenderRecaptcha("recap-signup", siteKey);

  async function onSubmit(data: SignupInput) {
    setServerError(null);
    try {
      let captchaToken: string | undefined;
      if (typeof window !== "undefined" && (window as any).grecaptcha) {
        const wid = widgetRef.current;
        captchaToken = (window as any).grecaptcha.getResponse(
          typeof wid === "number" ? wid : undefined
        );
      }

      if (!captchaToken) {
        setServerError("Please complete the CAPTCHA.");
        return;
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, captchaToken }),
      });

      const j = await res.json();
      if (!res.ok) {
        setServerError(j?.error || "Signup failed");
        if ((window as any).grecaptcha) {
          const wid = widgetRef.current;
          try {
            (window as any).grecaptcha.reset(typeof wid === "number" ? wid : undefined);
          } catch (e) {}
        }
        return;
      }

      alert("Account created successfully! Please log in.");
      router.push("/login");
    } catch (err) {
      setServerError("Network error");
    }
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-kh-light overflow-hidden relative">
      
      {/* ✅ Back to Home Link (Top Left) */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-kh-gray hover:text-kh-dark transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 max-h-[95vh] overflow-y-auto scrollbar-hide mx-4">
        
        {/* Header - Logo is clickable */}
        <div className="text-center mb-6">
           <Link href="/" className="inline-block mx-auto h-12 w-12 bg-gradient-to-br from-kh-purple to-purple-400 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4 hover:scale-105 transition-transform">K</Link>
           <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
           <p className="mt-2 text-sm text-gray-500">
             Already have an account? <Link href="/login" className="font-semibold text-kh-red hover:text-red-600 transition-colors">Sign in</Link>
           </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Full Name</label>
            <input
              {...register("name")}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Email Address</label>
            <input
              {...register("email")}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple transition-all"
              placeholder="you@iimidr.ac.in"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Username</label>
            <input
              {...register("username")}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple transition-all"
              placeholder="johndoe123"
            />
            {errors.username && <p className="mt-1 text-xs text-red-500 font-medium">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Password</label>
            <input
              {...register("password")}
              type="password"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>}
            
            <div className="mt-3">
               <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                 <div 
                    className={`h-full transition-all duration-500 ease-out ${strengthColors[score]}`} 
                    style={{ width: `${(score + 1) * 20}%` }} 
                 />
               </div>
               <p className="text-[10px] text-right mt-1 text-gray-400 uppercase font-medium tracking-wider">Strength: <span className={`text-${strengthColors[score].replace('bg-', '')}`}>{strengthLabel}</span></p>
            </div>
          </div>

          <div className="flex justify-center py-2">
             <div id="recap-signup" className="scale-90 origin-center" />
          </div>

          {serverError && (
            <div className="rounded-lg bg-red-50 p-3 border border-red-100">
              <div className="flex items-center gap-2 text-sm text-red-700">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                <p className="font-medium">{serverError}</p>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-kh-red hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kh-red disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creating account...
              </span>
            ) : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}