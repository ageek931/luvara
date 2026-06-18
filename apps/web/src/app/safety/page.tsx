"use client";

import { Shield, BadgeCheck, Eye, AlertTriangle, FileSearch, Scale, Clock, Users } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const layers = [
  {
    icon: BadgeCheck,
    title: "Identity & Verification",
    desc: "Multi-tier verification including photo selfie with liveness check, optional ID verification, and real-time anti-spoofing.",
    items: ["Photo verification with liveness detection (>99% accuracy)", "Government ID verification (encrypted)", "Video challenge-response anti-spoofing"],
  },
  {
    icon: Eye,
    title: "Behavioral Monitoring",
    desc: "AI-powered system detects fake profiles, romance scams, catfishing, and spam before they reach you.",
    items: ["Fake profile scoring (0-100) with auto-block at 85+", "Fraud detection for scams, catfishing, sextortion", "Device fingerprinting and IP anomaly detection"],
  },
  {
    icon: FileSearch,
    title: "Content Moderation",
    desc: "Real-time moderation of photos, messages, and voice snippets with AI and human review.",
    items: ["NSFW content blocked in real-time (>.95 confidence)", "Hate speech detection with graduated response", "Voice snippet transcription and moderation"],
  },
  {
    icon: AlertTriangle,
    title: "Reporting & Response",
    desc: "One-tap reporting with guaranteed response SLAs and transparent resolution tracking.",
    items: ["Under 5 min response for underage reports", "Under 15 min for explicit content", "Under 30 min for harassment"],
  },
  {
    icon: Scale,
    title: "Trust Score System",
    desc: "Every user has a transparent trust score based on verification, behavior, and community contribution.",
    items: ["0-100 score with visible tiers (Trusted/Standard/Limited/Restricted)", "Score increases with verification and positive behavior", "Negative actions decrease score with decay over time"],
  },
  {
    icon: Clock,
    title: "Appeals Process",
    desc: "Fair appeals with independent moderator review and clear resolution paths.",
    items: ["Submit appeals through support flow", "Different moderator reviews your case", "Decision: uphold, overturn, or modify"],
  },
];

export default function SafetyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Safety Center
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Your safety is our foundation. LUVARA is built with a five-layer trust and safety architecture — designed from day one, not added later.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="glass-card p-8 text-center">
                <p className="text-4xl font-bold text-green-600 mb-2">98%</p>
                <p className="text-gray-600">Verification Accuracy</p>
              </div>
              <div className="glass-card p-8 text-center">
                <p className="text-4xl font-bold text-green-600 mb-2">&lt;30min</p>
                <p className="text-gray-600">Avg. Report Response</p>
              </div>
              <div className="glass-card p-8 text-center">
                <p className="text-4xl font-bold text-green-600 mb-2">100%</p>
                <p className="text-gray-600">Active Profiles Verified</p>
              </div>
            </div>

            <div className="space-y-12">
              {layers.map((layer) => {
                const Icon = layer.icon;
                return (
                  <div key={layer.title} className="glass-card p-8 md:p-10">
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">{layer.title}</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">{layer.desc}</p>
                        <ul className="space-y-3">
                          {layer.items.map((item) => (
                            <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                              <BadgeCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Safety Tips for Users</h2>
            <p className="text-gray-600 mb-8">Follow these guidelines for a safe dating experience</p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {[
                "Keep conversations on the platform until you feel comfortable",
                "Meet in public places for your first few dates",
                "Tell a friend where you're going and who you're meeting",
                "Trust your instincts — if something feels off, report it",
                "Use LUVARA's built-in safety features like location sharing",
                "Never send money to someone you haven't met in person",
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{tip}</span>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link
                href="/report"
                className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 gradient-primary text-white shadow-lg hover:shadow-xl px-8 py-3"
              >
                Report a Concern
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
