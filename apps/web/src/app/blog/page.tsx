"use client";

import Link from "next/link";
import { Calendar, Clock, ArrowRight, Heart } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const posts = [
  {
    slug: "future-of-online-dating-2025",
    title: "The Future of Online Dating: Why AI Is Finally Ready for Love",
    excerpt: "After years of hype, AI is genuinely transforming how we find romantic partners. Here's what's changing and why LUVARA is leading the way.",
    category: "Dating Insights",
    author: "LUVARA Team",
    date: "Jan 15, 2025",
    readTime: "8 min read",
    image: "bg-gradient-to-br from-pink-400 to-purple-600",
  },
  {
    slug: "dating-app-safety-guide",
    title: "The Complete Guide to Staying Safe on Dating Apps",
    excerpt: "Your safety is non-negotiable. Learn how LUVARA's five-layer trust and safety architecture protects you — and tips for staying safe while dating.",
    category: "Safety",
    author: "Safety Team",
    date: "Jan 10, 2025",
    readTime: "12 min read",
    image: "bg-gradient-to-br from-green-400 to-teal-600",
  },
  {
    slug: "how-to-create-great-dating-profile",
    title: "How to Create a Dating Profile That Actually Gets Matches",
    excerpt: "Your profile is your first impression. Here are science-backed tips for photos, prompts, and bio that attract the right people.",
    category: "Tips & Advice",
    author: "LUVARA Team",
    date: "Jan 5, 2025",
    readTime: "10 min read",
    image: "bg-gradient-to-br from-blue-400 to-indigo-600",
  },
  {
    slug: "gamification-dating-apps-ethics",
    title: "Gamification in Dating Apps: Fun or Manipulative?",
    excerpt: "Not all gamification is created equal. We explain how LUVARA rewards quality behavior without exploiting psychological vulnerabilities.",
    category: "Product Philosophy",
    author: "Product Team",
    date: "Dec 28, 2024",
    readTime: "7 min read",
    image: "bg-gradient-to-br from-yellow-400 to-orange-600",
  },
  {
    slug: "meaningful-conversations-online-dating",
    title: "From Small Talk to Soul Talk: Having Better Conversations",
    excerpt: "Why most dating app conversations fizzle out — and how LUVARA's design helps you have the conversations that matter.",
    category: "Dating Insights",
    author: "LUVARA Team",
    date: "Dec 20, 2024",
    readTime: "9 min read",
    image: "bg-gradient-to-br from-red-400 to-pink-600",
  },
  {
    slug: "dating-apps-and-mental-health",
    title: "Dating Apps and Mental Health: Finding Balance",
    excerpt: "Dating apps can be emotionally taxing. We share research on dating fatigue and how LUVARA is designed to protect your wellbeing.",
    category: "Wellbeing",
    author: "Wellness Team",
    date: "Dec 15, 2024",
    readTime: "11 min read",
    image: "bg-gradient-to-br from-purple-400 to-violet-600",
  },
];

const categories = ["All", "Dating Insights", "Safety", "Tips & Advice", "Product Philosophy", "Wellbeing"];

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Heart className="w-12 h-12 text-pink-500 fill-pink-500 mx-auto mb-4" />
            <h1 className="text-5xl font-bold text-gray-900 mb-6">The LUVARA Blog</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Insights on modern dating, safety, AI matchmaking, and building meaningful connections.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 hover:border-pink-200 hover:text-pink-600 transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                  <article className="glass-card overflow-hidden">
                    <div className={`h-48 ${post.image} flex items-center justify-center`}>
                      <span className="text-white/30 text-6xl font-bold">{post.title[0]}</span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-pink-600 bg-pink-50 rounded-full px-3 py-1">
                          {post.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
