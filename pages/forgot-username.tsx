import { useForm } from "react-hook-form";

export default function ForgotUsername() {
  const { register, handleSubmit, formState: { isSubmitting, isSubmitSuccessful } } = useForm();

  const onSubmit = async (data: any) => {
    await fetch("/api/auth/forgot-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Forgot Username</h1>
      
      {isSubmitSuccessful ? (
        <div className="bg-green-50 text-green-800 p-4 rounded border border-green-200">
          If an account exists with that email, we've sent your username to it.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-kh-muted mb-1">Enter your email</label>
            <input {...register("email", { required: true })} type="email" className="w-full border p-2 rounded" placeholder="john@example.com" />
          </div>
          <button disabled={isSubmitting} className="w-full bg-kh-red text-white p-2 rounded">
            {isSubmitting ? "Sending..." : "Recover Username"}
          </button>
        </form>
      )}
    </div>
  );
}