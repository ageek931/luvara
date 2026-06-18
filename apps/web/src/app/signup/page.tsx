"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <Heart className="w-12 h-12 text-pink-500 fill-pink-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
            <p className="text-gray-600 mt-2">Join LUVARA and find your match</p>
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= s
                        ? "gradient-primary text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-12 h-1 mx-1 rounded ${
                        step > s ? "bg-pink-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-gray-900">Basic Info</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      className="w-full rounded-xl border border-gray-200 pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Name</label>
                  <input
                    type="text"
                    placeholder="How others see you"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full gradient-primary text-white rounded-full py-3 font-medium hover:shadow-lg transition-all"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-gray-900">About You</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Birthday</label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be 18+ to use LUVARA</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                  <select className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500">
                    <option value="">Select gender</option>
                    <option value="woman">Woman</option>
                    <option value="man">Man</option>
                    <option value="non_binary">Non-binary</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">What are you looking for?</label>
                  <select className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500">
                    <option value="">Select intent</option>
                    <option value="long_term_relationship">Long-term relationship</option>
                    <option value="casual_dating">Casual dating</option>
                    <option value="marriage_minded">Marriage-minded</option>
                    <option value="still_figuring_out">Still figuring it out</option>
                    <option value="new_friends">New friends</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white text-gray-700 border border-gray-200 rounded-full py-3 font-medium hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 gradient-primary text-white rounded-full py-3 font-medium hover:shadow-lg transition-all"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-gray-900">Almost Done!</h2>
                <div className="bg-pink-50 rounded-xl p-4 text-sm text-pink-800">
                  <p className="font-medium mb-1">You&apos;re joining 500K+ users</p>
                  <p>We&apos;ll help you build a great profile in the next steps.</p>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-pink-200 cursor-pointer">
                    <input type="checkbox" className="rounded text-pink-500 focus:ring-pink-500" />
                    <span className="text-sm text-gray-700">
                      I agree to the{" "}
                      <Link href="/terms" className="text-pink-600 hover:underline">Terms of Service</Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-pink-600 hover:underline">Privacy Policy</Link>
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-pink-200 cursor-pointer">
                    <input type="checkbox" className="rounded text-pink-500 focus:ring-pink-500" />
                    <span className="text-sm text-gray-700">
                      I am 18 years or older
                    </span>
                  </label>
                </div>
                <Link
                  href="/onboarding"
                  className="block text-center gradient-primary text-white rounded-full py-3 font-medium hover:shadow-lg transition-all"
                >
                  Create Account
                </Link>
                <button
                  onClick={() => setStep(2)}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Back
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-pink-600 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
