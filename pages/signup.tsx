// pages/signup.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "../lib/validators";
import { useRouter } from "next/router";
// @ts-ignore
import zxcvbn from "zxcvbn";
import { useState, useEffect, useRef } from "react";

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
          // if widget already rendered, reset it
          if (renderedRef.current && typeof g.reset === "function") {
            g.reset(widgetRef.current);
          } else {
            // render and store widget id
            const wid = g.render(elementId, { sitekey: siteKey });
            widgetRef.current = wid;
            renderedRef.current = true;
          }
        } catch (err) {
          // sometimes render can throw if called too early — try again shortly
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
  const strength = zxcvbn(password);
  const score = Math.min(Math.max(strength.score, 0), 4); // 0..4
  const strengthLabel = ["Very weak", "Weak", "Okay", "Good", "Strong"][score];
  const strengthPercent = (score / 4) * 100;

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const widgetRef = useRenderRecaptcha("recap-signup", siteKey);

  async function onSubmit(data: SignupInput) {
    setServerError(null);
    try {
      let captchaToken: string | undefined;
      if (typeof window !== "undefined" && (window as any).grecaptcha) {
        // use widgetId if available
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
          // reset the widget for retry
          const wid = widgetRef.current;
          try {
            (window as any).grecaptcha.reset(typeof wid === "number" ? wid : undefined);
          } catch (e) {}
        }
        return;
      }

      alert("Account created — please log in.");
      if ((window as any).grecaptcha) {
        const wid = widgetRef.current;
        try {
          (window as any).grecaptcha.reset(typeof wid === "number" ? wid : undefined);
        } catch (e) {}
      }
      router.push("/login");
    } catch (err) {
      setServerError("Network error");
      console.error(err);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4">Create your account</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 max-w-lg mx-auto"
      >
        {/* Full Name */}
        <input
          {...register("name")}
          placeholder="Full name (optional)"
          className="border border-gray-300 px-3 py-2 rounded w-full"
        />

        {/* Email */}
        <div>
          <input
            {...register("email")}
            placeholder="Email"
            type="email"
            className="border border-gray-300 px-3 py-2 rounded w-full"
          />
          {errors.email && (
            <div className="text-sm text-red-600 mt-1">
              {errors.email.message}
            </div>
          )}
        </div>

        {/* Username */}
        <div>
          <input
            {...register("username")}
            placeholder="Username"
            className="border border-gray-300 px-3 py-2 rounded w-full"
          />
          {errors.username && (
            <div className="text-sm text-red-600 mt-1">
              {errors.username.message}
            </div>
          )}
        </div>

        {/* Password */}
        <div>
          <input
            {...register("password")}
            placeholder="Password"
            type="password"
            className="border border-gray-300 px-3 py-2 rounded w-full"
          />
          {errors.password && (
            <div className="text-sm text-red-600 mt-1">
              {errors.password.message}
            </div>
          )}

          {/* Strength meter */}
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
              <div
                style={{ width: `${strengthPercent}%` }}
                className={`h-2 ${
                  score < 2
                    ? "bg-red-500"
                    : score < 3
                    ? "bg-yellow-400"
                    : "bg-green-500"
                }`}
              />
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {password
                ? `${strengthLabel} (${Math.round(strengthPercent)}%)`
                : "Enter a password to see strength"}
            </div>
          </div>
        </div>

        {/* reCAPTCHA v2 widget - use empty div with id */}
        <div className="mt-2">
          <div id="recap-signup" />
        </div>

        {/* Server error */}
        {serverError && (
          <div className="text-sm text-red-600">{serverError}</div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-red text-white p-2 rounded"
        >
          {isSubmitting ? "Creating..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
