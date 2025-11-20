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
    <div className="max-w-md mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Forgot Username</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Enter your email</label>
          <input 
            {...register("email", { required: true })} 
            type="email" 
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-600" 
            placeholder="john@example.com" 
          />
        </div>

        {/* ✅ Feedback Messages */}
        {feedback && (
          <div className={`p-3 rounded text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {feedback.msg}
          </div>
        )}

        {/* ✅ Orange Button */}
        <button 
          disabled={isSubmitting} 
          className="w-full bg-orange-600 hover:bg-orange-700 text-white p-2 rounded font-semibold transition-colors"
        >
          {isSubmitting ? "Sending..." : "Recover Username"}
        </button>

        <div className="text-center mt-4">
           <Link href="/login" className="text-sm text-gray-500 hover:text-orange-600">Back to Login</Link>
        </div>
      </form>
    </div>
  );
}