// pages/signup.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "../lib/validators";
import { useRouter } from "next/router";
import zxcvbn from "zxcvbn";
import { useState } from "react";

declare const grecaptcha: any;

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

  async function onSubmit(data: SignupInput) {
    setServerError(null);
    try {
      let captchaToken: string | undefined;
      if (typeof window !== "undefined" && (window as any).grecaptcha) {
        captchaToken = (window as any).grecaptcha.getResponse();
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
          (window as any).grecaptcha.reset();
        }
        return;
      }

      alert("Account created — please log in.");
      if ((window as any).grecaptcha) {
        (window as any).grecaptcha.reset();
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

        {/* reCAPTCHA v2 widget */}
        <div className="mt-2">
          <div
            className="g-recaptcha"
            data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
          ></div>
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
