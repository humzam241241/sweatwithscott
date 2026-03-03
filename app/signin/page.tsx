"use client";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const { status } = useSession();
  const searchParams = useSearchParams();
  const errorParam = searchParams?.get("error");
  const [email, setEmail] = useState("admin@cave.boxing");
  const [password, setPassword] = useState("SweatAdmin123!");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // If already authenticated (e.g., after Google redirect), go to dashboard
  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  // Surface NextAuth error messages on this page
  useEffect(() => {
    if (!errorParam) return;
    const map: Record<string, string> = {
      OAuthAccountNotLinked: "Email is already linked to a different signin method.",
      Configuration: "Google sign-in is not configured. Add GOOGLE_CLIENT_ID/SECRET and restart.",
      AccessDenied: "Access denied.",
      Verification: "Verification failed.",
      Callback: "Login failed during Google callback.",
    };
    setMessage(map[errorParam] || "Sign-in failed. Please try again.");
  }, [errorParam]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", { email, password, callbackUrl: "/dashboard", redirect: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-sm rounded-2xl p-8 bg-neutral-900/60 shadow-xl">
        <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
        {message && (
          <p className="mb-4 rounded bg-red-600/20 text-red-300 px-3 py-2 text-sm">{message}</p>
        )}
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
            onClick={() => signIn("google", { callbackUrl: "/dashboard", redirect: true })}
            className="w-full rounded-xl py-2 bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
