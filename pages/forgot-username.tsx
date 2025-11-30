// pages/forgot-username.tsx
import { useForm } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";

export default function ForgotUsername() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const onSubmit = async (data: any) => {
    setFeedback(null);
    try {
      const res = await fetch("/api/auth/forgot-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await res.json();

      if (res.ok) {
        setFeedback({ type: 'success', msg: j.message || "Username sent!" });
      } else {
        setFeedback({ type: 'error', msg: j.error || "Something went wrong" });
      }
    } catch (e) {
      setFeedback({ type: 'error', msg: "Network error" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kh-light px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/10">
        <h1 className="text-2xl font-bold mb-4 text-white">Forgot Username</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Enter your email</label>
            <input
              {...register("email", { required: true })}
              type="email"
              className="w-full bg-black/20 border border-white/10 p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-kh-purple placeholder-gray-500"
              placeholder="john@example.com"
            />
          </div>

          {/* ✅ Feedback Messages */}
          {feedback && (
            <div className={`p-3 rounded text-sm ${feedback.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {feedback.msg}
            </div>
          )}

          {/* ✅ Purple Button */}
          <button
            disabled={isSubmitting}
            className="w-full bg-kh-purple hover:bg-purple-600 text-white p-2 rounded font-semibold transition-colors"
          >
            {isSubmitting ? "Sending..." : "Recover Username"}
          </button>

          <div className="text-center mt-4">
            <Link href="/login" className="text-sm text-gray-400 hover:text-kh-purple">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}