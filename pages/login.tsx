// pages/login.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

declare const grecaptcha: any;

type FormData = {
  identifier: string;
  password: string;
};

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      let captchaToken: string | undefined;
      if (typeof window !== "undefined" && (window as any).grecaptcha) {
        captchaToken = (window as any).grecaptcha.getResponse();
      }

      if (!captchaToken) {
        alert("Please complete the CAPTCHA.");
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, captchaToken }),
      });

      const j = await res.json();
      if (!res.ok) {
        alert(j?.error || "Login failed");
        if ((window as any).grecaptcha) (window as any).grecaptcha.reset();
        return;
      }

      if ((window as any).grecaptcha) (window as any).grecaptcha.reset();
      router.replace("/");
    } catch (err) {
      alert("Network error");
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* identifier */}
        <div>
          <label className="text-sm text-kh-muted mb-1 block">Email or Username</label>
          <input
            {...register("identifier", { required: "Enter email or username" })}
            placeholder="Email or username"
            className="border border-gray-300 px-3 py-2 rounded w-full"
            autoComplete="username"
          />
          {errors.identifier && (
            <div className="text-sm text-red-600 mt-1">{errors.identifier.message}</div>
          )}
        </div>

        {/* password */}
        <div>
          <label className="text-sm text-kh-muted mb-1 block">Password</label>
          <input
            {...register("password", { required: "Enter password" })}
            placeholder="Password"
            type="password"
            className="border border-gray-300 px-3 py-2 rounded w-full"
            autoComplete="current-password"
          />
          {errors.password && (
            <div className="text-sm text-red-600 mt-1">{errors.password.message}</div>
          )}
        </div>

        {/* reCAPTCHA widget (v2) */}
        <div className="mt-2">
          <div
            className="g-recaptcha"
            data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
          />
        </div>

        {/* submit */}
        <button
           type="submit"
           disabled={isSubmitting}
           style={{ background: "#F2564C" }} // exact kh-red hex; guaranteed
          className="w-full text-white p-2 rounded disabled:opacity-60"
          >
          {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
      </form>
    </div>
  );
}
