"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const faqCategories = [
  {
    category: "Getting Started",
    questions: [
      { q: "How do I create an account?", a: "Sign up with your email, Google, or Apple account. You'll need to provide basic info, upload photos, and answer a few prompts. It takes under 3 minutes." },
      { q: "Is LUVARA free?", a: "Yes! Core features including profile creation, swiping, matching, and messaging are completely free. Premium and Elite tiers offer enhancements like seeing who liked you, read receipts, and travel mode." },
      { q: "How does verification work?", a: "Photo verification uses real-time selfie with liveness detection. You'll be asked to blink or turn your head. Once verified, you get a trust score boost and a verified badge." },
      { q: "What's the minimum age requirement?", a: "You must be 18 or older to use LUVARA. We verify age through your provided birthday and have age estimation AI to flag suspicious accounts." },
    ],
  },
  {
    category: "Matching & Discovery",
    questions: [
      { q: "How does matching work?", a: "LUVARA uses a hybrid discovery system: swipe cards, prompt-comment interactions, compatibility rows, and AI Best Match. When both users Like each other, it's a match!" },
      { q: "What are compatibility rows?", a: "Horizontal scrollable rows of profiles organized by shared themes like 'Same travel style', 'Same values', or 'Same interests'. Free users get 2 rows, Premium gets 5." },
      { q: "How does AI matchmaking work?", a: "Our AI learns from your swipes, messages, and feedback to improve recommendations. It uses collaborative filtering, behavioral sequencing, and diversity guarantees." },
      { q: "How long does a match last?", a: "Matches expire after 48 hours if no conversation is started. You can extend a match using coins or with Premium membership." },
    ],
  },
  {
    category: "Safety & Privacy",
    questions: [
      { q: "Is my data safe?", a: "Yes. We encrypt sensitive data at rest, never use message content for training, and follow strict privacy practices. You can view, edit, or delete your data anytime." },
      { q: "How do I report someone?", a: "Tap the flag icon on any profile or conversation. Choose the reason and submit. Reports are reviewed within minutes for urgent cases." },
      { q: "What is the trust score?", a: "A 0-100 score visible only to you that combines verification status, profile completeness, account age, positive behavior, and community contribution." },
      { q: "Can I block someone?", a: "Yes. You can block any user at any time. Blocked users cannot view your profile or contact you. You can also block and report simultaneously." },
    ],
  },
  {
    category: "Subscription & Payments",
    questions: [
      { q: "What's included in Premium?", a: "Unlimited likes, see who liked you, read receipts, unlimited rewinds, 5 compatibility rows, travel mode, incognito mode, 200 coins/month, and more." },
      { q: "What's included in Elite?", a: "Everything in Premium plus unlimited AI Best Match, custom rows, ID verification, VIP support, 500 coins/month, exclusive events, date concierge, and +20% XP boost." },
      { q: "Can I cancel my subscription?", a: "Yes, you can cancel anytime from Settings. Your benefits continue until the end of the billing period. No questions asked." },
      { q: "Do you offer refunds?", a: "We offer pro-rated refunds within 7 days of purchase for annual subscriptions. Monthly subscriptions can be canceled anytime." },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<{ category: number; question: number } | null>(null);

  return (
    <>
      <Navbar />
      <main className="pt-24">
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Everything you need to know about LUVARA
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {faqCategories.map((cat, catIdx) => (
              <div key={cat.category} className="mb-12 last:mb-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{cat.category}</h2>
                <div className="space-y-3">
                  {cat.questions.map((faq, qIdx) => {
                    const isOpen = openIndex?.category === catIdx && openIndex?.question === qIdx;
                    return (
                      <div key={faq.q} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : { category: catIdx, question: qIdx })}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900">{faq.q}</span>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5">
                            <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
