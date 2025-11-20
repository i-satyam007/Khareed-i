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
  // Calculate password strength
  const strength = (typeof window !== "undefined" && zxcvbn) ? zxcvbn(password) : { score: 0 };
  const score = Math.min(Math.max(strength.score ?? 0, 0), 4);
  
  // Custom colors for strength bar
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
    <div className="min-h-screen flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-kh-light">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
         <div className="mx-auto h-12 w-12 bg-kh-purple rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">K</div>
         <h2 className="text-3xl font-bold text-kh-dark">Create your account</h2>
         <p className="mt-2 text-sm text-kh-gray">
           Already have an account? <Link href="/login" className="font-medium text-kh-red hover:text-red-500">Sign in</Link>
         </p>
      </div>

      <div className="auth-card sm:px-10">
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-kh-gray mb-1">Full Name</label>
            <input
              {...register("name")}
              className="input-field"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-kh-gray mb-1">Email Address</label>
            <input
              {...register("email")}
              className="input-field"
              placeholder="you@iimidr.ac.in"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-kh-gray mb-1">Username</label>
            <input
              {...register("username")}
              className="input-field"
              placeholder="johndoe123"
            />
            {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-kh-gray mb-1">Password</label>
            <input
              {...register("password")}
              type="password"
              className="input-field"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            
            {/* Password Strength Bar */}
            <div className="mt-3">
               <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                 <div 
                    className={`h-full transition-all duration-300 ${strengthColors[score]}`} 
                    style={{ width: `${(score + 1) * 20}%` }} 
                 />
               </div>
               <p className="text-xs text-right mt-1 text-gray-500">Strength: <span className="font-medium text-kh-dark">{strengthLabel}</span></p>
            </div>
          </div>

          {/* CAPTCHA */}
          <div className="flex justify-center pt-2">
             <div id="recap-signup" className="scale-90 sm:scale-100 origin-center" />
          </div>

          {/* Error Messages */}
          {serverError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Signup Failed</h3>
                  <div className="mt-2 text-sm text-red-700"><p>{serverError}</p></div>
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}