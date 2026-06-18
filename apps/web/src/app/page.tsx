"use client";

import Link from "next/link";
import { Heart, Sparkles, Shield, MessageHeart, Users, ArrowRight, Star, Check, Download } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Matching",
    description: "Our self-improving AI learns your preferences and behavior to find genuinely compatible matches — not just people nearby.",
  },
  {
    icon: Shield,
    title: "Trust-First Safety",
    description: "Multi-layer verification, real-time moderation, and a transparent trust score system so you know who's real.",
  },
  {
    icon: MessageHeart,
    title: "Meaningful Conversations",
    description: "Smart icebreakers, prompt-comment discovery, and conversation nudges that lead to real connection — not endless small talk.",
  },
  {
    icon: Users,
    title: "Hybrid Discovery",
    description: "Swipe, prompt-comment, compatibility rows, and AI Best Match — four ways to find someone who's right for you.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create Your Profile",
    description: "Upload photos, answer prompts, and let our AI assist you in showing your authentic self. Takes under 3 minutes.",
  },
  {
    step: "02",
    title: "Get Verified",
    description: "Photo verification builds trust. Verified profiles get higher visibility and a trust badge.",
  },
  {
    step: "03",
    title: "Discover Matches",
    description: "Swipe, comment on prompts, browse compatibility rows, or let AI recommend your Best Match of the day.",
  },
  {
    step: "04",
    title: "Connect Meaningfully",
    description: "AI-suggested icebreakers, conversation health nudges, and date planning assistance — designed for real connection.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    age: 29,
    location: "San Francisco",
    text: "I'd given up on dating apps until LUVARA. The prompt-comment feature helped me find someone who actually shares my values. We've been together for 6 months.",
    rating: 5,
  },
  {
    name: "James K.",
    age: 34,
    location: "New York",
    text: "The trust score and verification made me feel safe in a way other apps never did. Met someone amazing within the first week.",
    rating: 5,
  },
  {
    name: "Elena R.",
    age: 27,
    location: "London",
    text: "Finally, an app that rewards quality over quantity. The AI recommendations are scarily accurate. This is how dating should feel.",
    rating: 5,
  },
];

const trustSignals = [
  { stat: "98%", label: "Verification Accuracy" },
  { stat: "<30min", label: "Avg. Report Response" },
  { stat: "4.8★", label: "App Store Rating" },
  { stat: "500K+", label: "Active Users" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="gradient-hero min-h-screen flex items-center pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-medium text-pink-700">
                  <Sparkles className="w-4 h-4" />
                  The premium dating experience
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                  Find Your{" "}
                  <span className="text-gradient">Real, Ready,</span>
                  <br />
                  Right Match
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Meet people who are real, ready, and right for you — faster, safer, and with less effort than any other platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 gradient-primary text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] px-8 py-4 text-lg"
                  >
                    Find Your Match
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 px-8 py-4 text-lg shadow-sm"
                  >
                    See How It Works
                  </Link>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Free to match & message
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    No swipe limits
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    3-day free trial
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-center">
                <div className="relative w-80 h-[600px]">
                  <div className="absolute inset-0 bg-gradient-to-b from-pink-400 to-pink-600 rounded-[3rem] shadow-2xl transform rotate-6 scale-95 opacity-50" />
                  <div className="absolute inset-0 glass-card rounded-[3rem] p-8 flex flex-col items-center justify-center border border-white/30">
                    <Heart className="w-16 h-16 text-pink-500 fill-pink-500 mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">LUVARA</h3>
                    <p className="text-gray-500 text-center mb-6">Premium Dating</p>
                    <div className="space-y-4 w-full">
                      <div className="glass rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-300 to-pink-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Alex, 28</p>
                          <p className="text-xs text-gray-500">Intentional • Verified</p>
                        </div>
                      </div>
                      <div className="glass rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-300 to-purple-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Jordan, 31</p>
                          <p className="text-xs text-gray-500">Authentic • Verified</p>
                        </div>
                      </div>
                      <div className="glass rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-300 to-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Taylor, 26</p>
                          <p className="text-xs text-gray-500">Genuine • Verified</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center gap-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-500" />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">4.8 average rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {trustSignals.map((signal) => (
                <div key={signal.label} className="text-center">
                  <p className="text-4xl font-bold text-gray-900 mb-1">{signal.stat}</p>
                  <p className="text-sm text-gray-500">{signal.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Four simple steps to find your real, ready, right match.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/how-it-works"
                className="inline-flex items-center text-pink-600 font-medium hover:text-pink-700"
              >
                Learn more about how LUVARA works
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why LUVARA Is Different
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We built a platform that optimizes for outcomes — not engagement time.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="glass-card p-8 text-center">
                    <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Real Stories from Real People
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join 500K+ users who found meaningful connections on LUVARA.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <div key={t.name} className="glass-card p-8">
                  <div className="flex items-center gap-1 text-yellow-500 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.age}, {t.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 gradient-primary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Find Your Match?
            </h2>
            <p className="text-xl text-pink-100 mb-10 max-w-2xl mx-auto">
              Join LUVARA today. Free to match, message, and meet. Premium when you&apos;re ready for more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 bg-white text-pink-700 hover:bg-pink-50 shadow-xl hover:shadow-2xl px-8 py-4 text-lg"
              >
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/download"
                className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 bg-transparent text-white border-2 border-white/50 hover:bg-white/10 px-8 py-4 text-lg"
              >
                <Download className="mr-2 w-5 h-5" />
                Download the App
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
