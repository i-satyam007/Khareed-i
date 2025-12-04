// pages/forgot-password.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Eye, EyeOff } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const router = useRouter();

  const onRequestOTP = async (data: any) => {
    setError(null);
    setEmail(data.email);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const j = await res.json();
      if (res.ok) {
        setStep(2);
      } else {
        setError(j.error || "Something went wrong (check email validity)");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const onReset = async (data: any) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: data.otp,
          newPassword: data.newPassword
        }),
      });

      const j = await res.json();
      if (res.ok) {
        alert("Password reset successful! Login now.");
        router.push("/login");
      } else {
        setError(j.error || "Failed to reset");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSubmit(onRequestOTP)} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Enter your email</label>
            <input {...register("email", { required: true })} type="email" className="w-full border p-2 rounded focus:ring-orange-600 focus:outline-none" placeholder="john@example.com" />
          </div>
          {/* ✅ Orange Button */}
          <button disabled={isSubmitting} className="w-full bg-orange-600 hover:bg-orange-700 text-white p-2 rounded font-semibold">
            {isSubmitting ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onReset)} className="space-y-4">
          <p className="text-sm text-gray-600">OTP sent to {email}</p>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Enter OTP</label>
            <input {...register("otp", { required: true })} className="w-full border p-2 rounded" placeholder="123456" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">New Password</label>
            <div className="relative">
              <input
                {...register("newPassword", { required: true, minLength: 6 })}
                type={showPassword ? "text" : "password"}
                className="w-full border p-2 rounded pr-10"
                placeholder="New strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {/* ✅ Orange Button */}
          <button disabled={isSubmitting} className="w-full bg-orange-600 hover:bg-orange-700 text-white p-2 rounded font-semibold">
            {isSubmitting ? "Resetting..." : "Set New Password"}
          </button>
        </form>
      )}
    </div>
  );
}