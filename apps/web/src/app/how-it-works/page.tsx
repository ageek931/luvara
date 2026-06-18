"use client";

import { Sparkles, Heart, MessageHeart, Shield, Users, Brain, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const sections = [
  {
    icon: Heart,
    title: "Hybrid Discovery",
    subtitle: "Four ways to find your match",
    items: [
      { title: "Swipe Cards", desc: "Browse profiles with our glassmorphic card stack. Like, Pass, or send a Super Interest." },
      { title: "Prompt-Comment", desc: "See anonymous prompt responses and comment to start a conversation — no photo bias." },
      { title: "Compatibility Rows", desc: "Discover matches by shared interests, values, travel style, and more." },
      { title: "AI Best Match", desc: "Your daily AI-curated pick with a detailed compatibility narrative." },
    ],
  },
  {
    icon: Brain,
    title: "AI-Powered Matching",
    subtitle: "Smarter recommendations that learn from you",
    items: [
      { title: "Preference Learning", desc: "Our AI learns your preferences from your behavior and feedback." },
      { title: "Intent Alignment", desc: "We prioritize matching people with compatible relationship goals." },
      { title: "Fairness-Aware Ranking", desc: "Diversity guarantees ensure you see beyond your usual type." },
      { title: "Explainable AI", desc: "Every recommendation shows why — transparency built in." },
    ],
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    subtitle: "Your safety is our foundation",
    items: [
      { title: "Photo Verification", desc: "Real-time selfie with liveness check. Verified badge and trust score boost." },
      { title: "Behavioral Monitoring", desc: "AI detects fake profiles, scams, and harassment in real time." },
      { title: "Trust Score", desc: "Every user has a trust score based on verification, behavior, and engagement." },
      { title: "24/7 Moderation", desc: "Reports reviewed within minutes. Urgent cases in under 5 minutes." },
    ],
  },
  {
    icon: Star,
    title: "Gamification That Respects You",
    subtitle: "Earn rewards for quality behavior",
    items: [
      { title: "XP & Levels", desc: "Earn XP for completing your profile, verifying, thoughtful messaging, and more." },
      { title: "Badges & Streaks", desc: "Show off your achievements. Daily streaks keep you consistent (no punishment for breaks)." },
      { title: "Missions & Challenges", desc: "Daily, weekly, and seasonal challenges with XP and coin rewards." },
      { title: "Fair Design", desc: "No XP for swiping. Coins enhance experience, never determine match eligibility." },
    ],
  },
  {
    icon: MessageHeart,
    title: "Meaningful Conversations",
    subtitle: "Designed for real connection",
    items: [
      { title: "Smart Icebreakers", desc: "AI-suggested first messages based on your match's profile." },
      { title: "Conversation Nudges", desc: "Gentle reminders to keep the conversation flowing." },
      { title: "Date Planning", desc: "Built-in date proposal cards, venue suggestions, and safety checklist." },
      { title: "Consent First", desc: "Photo share confirmation, call consent, and explicit content blocking." },
    ],
  },
  {
    icon: Users,
    title: "Premium Features",
    subtitle: "Fair monetization that enhances",
    items: [
      { title: "Free to Match & Message", desc: "Free users can match, message, converse, and date." },
      { title: "See Who Liked You", desc: "Premium users see their likes grid — clear, not blurred." },
      { title: "Travel Mode", desc: "Set your location anywhere and start matching before you arrive." },
      { title: "Elite Experience", desc: "VIP support, concierge, anonymous browsing, and exclusive events." },
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm font-medium text-pink-700 shadow-sm mb-6">
              <Sparkles className="w-4 h-4" />
              How LUVARA Works
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Dating Reimagined
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              LUVARA combines the best of swipe-based discovery with depth-driven matching, AI-powered compatibility, and trust-first safety — all in one beautiful platform.
            </p>
          </div>
        </section>

        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <section key={section.title} className={`py-20 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{section.title}</h2>
                  <p className="text-lg text-gray-600">{section.subtitle}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {section.items.map((item) => (
                    <div key={item.title} className="glass-card p-6">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        <section className="py-20 gradient-primary">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Experience Dating Differently?
            </h2>
            <p className="text-lg text-pink-100 mb-8">
              Free to match and message. Premium when you&apos;re ready for more.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 bg-white text-pink-700 hover:bg-pink-50 shadow-xl hover:shadow-2xl px-8 py-4 text-lg"
            >
              Create Your Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
