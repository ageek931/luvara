import Link from "next/link";
import { Heart } from "lucide-react";

const footerLinks = {
  Product: [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/safety", label: "Safety Center" },
    { href: "/faq", label: "FAQ" },
  ],
  Company: [
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About Us" },
    { href: "/careers", label: "Careers" },
    { href: "/press", label: "Press Kit" },
  ],
  Support: [
    { href: "/help", label: "Help Center" },
    { href: "/contact", label: "Contact Us" },
    { href: "/community", label: "Community Guidelines" },
    { href: "/safety-tips", label: "Safety Tips" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
              <span className="text-lg font-bold text-white">LUVARA</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              The premium dating platform where AI enhances compatibility, safety enables vulnerability, and design inspires connection.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} LUVARA. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Made with care for meaningful connections.
          </p>
        </div>
      </div>
    </footer>
  );
}
