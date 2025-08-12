"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [email, setEmail] = useState("admin@cave.boxing");
  const [password, setPassword] = useState("CaveAdmin123!");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-sm rounded-2xl p-8 bg-neutral-900/60 shadow-xl">
        <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">Email</label>
            <input className="w-full rounded-xl px-3 py-2 bg-neutral-800 outline-none"
                   value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <label className="block mb-1 text-sm">Password</label>
            <input className="w-full rounded-xl px-3 py-2 bg-neutral-800 outline-none"
                   value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required />
          </div>
          <button disabled={loading}
                  className="w-full rounded-xl py-2 bg-white text-black font-medium hover:opacity-90 transition">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full rounded-xl py-2 bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
