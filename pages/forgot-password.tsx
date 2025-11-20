import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP + New Password
  const [email, setEmail] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const router = useRouter();

  // Step 1: Request OTP
  const onRequestOTP = async (data: any) => {
    setEmail(data.email);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email }),
    });
    if (res.ok) setStep(2);
    else alert("Something went wrong");
  };

  // Step 2: Reset Password
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

    if (res.ok) {
      alert("Password reset successful! Login now.");
      router.push("/login");
    } else {
      const j = await res.json();
      alert(j.error || "Failed to reset");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      
      {step === 1 ? (
        <form onSubmit={handleSubmit(onRequestOTP)} className="space-y-4">
          <div>
            <label className="block text-sm text-kh-muted mb-1">Enter your email</label>
            <input {...register("email", { required: true })} type="email" className="w-full border p-2 rounded" placeholder="john@example.com" />
          </div>
          <button disabled={isSubmitting} className="w-full bg-kh-red text-white p-2 rounded">
            {isSubmitting ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onReset)} className="space-y-4">
          <p className="text-sm text-kh-muted">OTP sent to {email}</p>
          <div>
            <label className="block text-sm text-kh-muted mb-1">Enter OTP</label>
            <input {...register("otp", { required: true })} className="w-full border p-2 rounded" placeholder="123456" />
          </div>
          <div>
            <label className="block text-sm text-kh-muted mb-1">New Password</label>
            <input {...register("newPassword", { required: true, minLength: 6 })} type="password" className="w-full border p-2 rounded" placeholder="New strong password" />
          </div>
          <button disabled={isSubmitting} className="w-full bg-kh-purple text-white p-2 rounded">
            {isSubmitting ? "Resetting..." : "Set New Password"}
          </button>
        </form>
      )}
    </div>
  );
}