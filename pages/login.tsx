// pages/login.tsx
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
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

type FormData = { identifier: string; password: string; };

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const router = useRouter();

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const widgetRef = useRenderRecaptcha("recap-login", siteKey);

  const onSubmit = async (data: FormData) => {
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
        alert(j?.error || "Login failed");
        if ((window as any).grecaptcha) {
          try {
            const wid = widgetRef.current;
            (window as any).grecaptcha.reset(typeof wid === "number" ? wid : undefined);
          } catch (e) {}
        }
        return;
      }
      router.replace("/");
    } catch (err) {
      alert("Network error");
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input {...register("identifier", { required: "Email or username required" })} placeholder="Email or username" className="w-full p-2 border rounded" />
        {errors.identifier && <div className="text-sm text-orange-600">{errors.identifier.message}</div>}
        <input {...register("password", { required: "Password required" })} type="password" placeholder="Password" className="w-full p-2 border rounded" />
        {errors.password && <div className="text-sm text-orange-600">{errors.password.message}</div>}

        <div className="text-right mt-1">
        <Link href="/forgot-password" className="text-xs text-kh-purple hover:underline">
        Forgot password?
        </Link>
        </div>
        {/* reCAPTCHA widget */}
        <div className="mt-2">
          <div id="recap-login" />
        </div>

        <button className="w-full bg-primary-red text-white p-2 rounded" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
