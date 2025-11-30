// pages/forgot-password.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const router = useRouter();

  const onRequestOTP = async (data: any) => {
    setEmail(data.email);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email }),
    });
    if (res.ok) setStep(2);
    else alert("Something went wrong (check email validity)");
  };

  const onReset = async (data: any) => {
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
      alert(j.error || "Failed to reset");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kh-light px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/10">
        <h1 className="text-2xl font-bold mb-4 text-white">Reset Password</h1>

        {step === 1 ? (
          <form onSubmit={handleSubmit(onRequestOTP)} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Enter your email</label>
              <input {...register("email", { required: true })} type="email" className="w-full bg-black/20 border border-white/10 p-2 rounded text-white focus:ring-kh-purple focus:outline-none placeholder-gray-500" placeholder="john@example.com" />
            </div>
            {/* ✅ Purple Button */}
            <button disabled={isSubmitting} className="w-full bg-kh-purple hover:bg-purple-600 text-white p-2 rounded font-semibold transition-colors">
              {isSubmitting ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onReset)} className="space-y-4">
            <p className="text-sm text-gray-400">OTP sent to {email}</p>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Enter OTP</label>
              <input {...register("otp", { required: true })} className="w-full bg-black/20 border border-white/10 p-2 rounded text-white focus:ring-kh-purple focus:outline-none placeholder-gray-500" placeholder="123456" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">New Password</label>
              <input {...register("newPassword", { required: true, minLength: 6 })} type="password" className="w-full bg-black/20 border border-white/10 p-2 rounded text-white focus:ring-kh-purple focus:outline-none placeholder-gray-500" placeholder="New strong password" />
            </div>
            {/* ✅ Purple Button */}
            <button disabled={isSubmitting} className="w-full bg-kh-purple hover:bg-purple-600 text-white p-2 rounded font-semibold transition-colors">
              {isSubmitting ? "Resetting..." : "Set New Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}