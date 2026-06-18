"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Sparkles, Crown, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const plans = [
  {
    name: "Core",
    tagline: "Free — forever",
    price: { monthly: 0, annual: 0 },
    icon: Star,
    features: [
      { included: true, text: "Full profile creation" },
      { included: true, text: "Swipe, prompt-comment, compatibility rows" },
      { included: true, text: "Match & message" },
      { included: true, text: "Photo verification" },
      { included: true, text: "XP & badges" },
      { included: true, text: "Report & block" },
      { included: false, text: "See who liked you" },
      { included: false, text: "Unlimited rewinds" },
      { included: false, text: "Read receipts" },
      { included: false, text: "Travel mode" },
      { included: false, text: "Priority support" },
    ],
  },
  {
    name: "Premium",
    tagline: "Most popular",
    price: { monthly: 1499, annual: 899 },
    icon: Sparkles,
    popular: true,
    features: [
      { included: true, text: "Everything in Core" },
      { included: true, text: "Unlimited likes" },
      { included: true, text: "See who liked you" },
      { included: true, text: "Read receipts" },
      { included: true, text: "Unlimited rewinds" },
      { included: true, text: "5 compatibility rows" },
      { included: true, text: "AI Best Match (5/day)" },
      { included: true, text: "Travel mode" },
      { included: true, text: "Incognito mode" },
      { included: true, text: "200 coins/month" },
      { included: true, text: "Priority support" },
    ],
  },
  {
    name: "Elite",
    tagline: "The ultimate experience",
    price: { monthly: 3499, annual: 1999 },
    icon: Crown,
    features: [
      { included: true, text: "Everything in Premium" },
      { included: true, text: "Unlimited AI Best Match" },
      { included: true, text: "Custom compatibility rows" },
      { included: true, text: "ID verification included" },
      { included: true, text: "VIP support (1h response)" },
      { included: true, text: "500 coins/month" },
      { included: true, text: "Exclusive events" },
      { included: true, text: "Auto-extended matches" },
      { included: true, text: "Date concierge" },
      { included: true, text: "Anonymous browsing" },
      { included: true, text: "+20% XP boost" },
    ],
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  function formatPrice(cents: number) {
    if (cents === 0) return "$0";
    return `$${(cents / 100).toFixed(0)}`;
  }

  return (
    <>
      <Navbar />
      <main className="pt-24">
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Fair Pricing for Real Connection
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">
              Free users can match, message, converse, and date. Premium enhances the experience — it never gates the essentials.
            </p>

            <div className="inline-flex items-center bg-white rounded-full p-1 shadow-sm border border-gray-200 mb-12">
              <button
                onClick={() => setAnnual(false)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  !annual ? "gradient-primary text-white shadow-md" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  annual ? "gradient-primary text-white shadow-md" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Annual
                <span className="ml-1.5 text-xs opacity-80">Save 40%</span>
              </button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const priceCents = annual ? plan.price.annual : plan.price.monthly;
                const periodLabel = annual ? "/mo, billed annually" : "/mo";

                return (
                  <div
                    key={plan.name}
                    className={`glass-card p-8 relative ${
                      plan.popular ? "ring-2 ring-pink-500 scale-105" : ""
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-white text-xs font-medium px-4 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                        plan.popular ? "gradient-primary" : "bg-gray-100"
                      }`}>
                        <Icon className={`w-6 h-6 ${plan.popular ? "text-white" : "text-gray-600"}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">{plan.tagline}</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(priceCents)}
                        </span>
                        {priceCents > 0 && (
                          <span className="text-sm text-gray-500">{periodLabel}</span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature.text} className="flex items-start gap-3 text-sm">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          )}
                          <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={priceCents === 0 ? "/signup" : "/signup?plan=" + plan.name.toLowerCase()}
                      className={`block text-center rounded-full py-3 text-sm font-medium transition-all ${
                        plan.popular
                          ? "gradient-primary text-white shadow-lg hover:shadow-xl"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {priceCents === 0 ? "Get Started Free" : `Start ${plan.name}`}
                    </Link>

                    {priceCents > 0 && (
                      <p className="text-center text-xs text-gray-400 mt-3">
                        3-day free trial. Cancel anytime.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="max-w-3xl mx-auto mt-16 glass-card p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {[
                  { q: "Can I use LUVARA for free?", a: "Yes! Free users can create a full profile, swipe, match, message, and go on dates. There are no paywalls on essential features." },
                  { q: "How does the free trial work?", a: "All new Premium and Elite subscribers get a 3-day free trial. You won't be charged until the trial ends, and you can cancel anytime." },
                  { q: "Can I switch plans?", a: "Yes, you can upgrade or downgrade at any time. Changes take effect at the start of your next billing period." },
                  { q: "Is my payment information secure?", a: "Absolutely. All payments are processed through Stripe, a PCI-DSS Level 1 certified payment processor. We never store your card details." },
                ].map((faq) => (
                  <div key={faq.q} className="border-b border-gray-100 pb-4 last:border-0">
                    <p className="font-medium text-gray-900 mb-1">{faq.q}</p>
                    <p className="text-sm text-gray-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
