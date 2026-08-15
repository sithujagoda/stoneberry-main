"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1. Call Backend API to register the user
      const registerRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const registerData = await registerRes.json();
      if (!registerRes.ok || !registerData.success) {
        setError(registerData.error || "Failed to register account.");
        setLoading(false);
        return;
      }

      // 2. Automate login on successful registration
      const loginResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (loginResult?.error) {
        setError("Account created, but automatic sign-in failed. Please login manually.");
        router.push("/login");
      } else {
        // Redirect to home (which redirects to onboarding because is_complete is false)
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError("An error occurred during registration. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] bg-stoneberry-beige font-sans overflow-hidden">
      
      {/* Left Column - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-full lg:w-[35%] xl:w-[30%] relative pl-12 xl:pl-20 py-16">
        
        {/* Top Logo and Text */}
        <div>
          <Image 
            src="/images/gem_logo.png" 
            alt="Stoneberry Logo" 
            width={80} 
            height={80} 
            className="object-contain mb-6 w-16 h-auto"
            priority
          />
          <p className="text-[14px] text-neutral-700 font-medium leading-relaxed">
            Discover and showcase exceptional<br />gemstones in a marketplace built<br />on trust and transparency
          </p>
        </div>
        
        {/* Middle Image */}
        <div className="my-auto w-full max-w-[280px]">
          <Image
            src="/images/login_tweezers.png"
            alt="Tweezers with Gemstone"
            width={300}
            height={300}
            className="object-cover w-full"
            priority
          />
        </div>

        {/* Decorative Lines at Bottom */}
        <div className="absolute bottom-16 left-0 w-full">
          <div className="h-[2px] bg-black w-[55%] mb-8"></div>
          <div className="h-[1px] bg-[#d4d0c8] w-[80%] ml-[20%]"></div>
        </div>
      </div>

      {/* Right Column - Create Account Panel */}
      <div className="w-full lg:w-[65%] xl:w-[70%] flex items-stretch justify-end">
        <div className="w-full bg-white lg:rounded-l-[4rem] flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
          <div className="w-full max-w-[600px]">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-[0.15em] text-black mb-12">
              Create Account
            </h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 border border-neutral-200 rounded-lg text-sm text-black placeholder-neutral-300 focus:outline-none focus:border-neutral-400 transition-colors bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-12 border border-neutral-200 rounded-lg text-sm text-black placeholder-neutral-300 focus:outline-none focus:border-neutral-400 transition-colors bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors"
                  >
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Confirm Your Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-12 border border-neutral-200 rounded-lg text-sm text-black placeholder-neutral-300 focus:outline-none focus:border-neutral-400 transition-colors bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors"
                  >
                    {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-white hover:bg-neutral-800 transition-colors font-semibold text-sm rounded-lg mt-6 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Social login divider */}
            <div className="mt-10 text-center">
              <p className="text-sm text-neutral-500 font-medium mb-6">
                Or Create Account From
              </p>
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-12 h-12 rounded-full border border-neutral-300 flex items-center justify-center mx-auto hover:bg-neutral-50 transition-colors"
                aria-label="Sign up with Google"
              >
                <span className="font-bold text-lg text-black">G</span>
              </button>
            </div>

            <div className="mt-12 text-center text-sm text-neutral-600 font-medium">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#C89B7B] hover:underline transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
