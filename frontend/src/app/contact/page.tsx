import React from 'react';
import ContactForm from '../../components/ContactForm';
import SectionHeading from '../../components/SectionHeading';
import Link from 'next/link';
import { siteConfig } from '../../data/siteConfig';

export const metadata = {
  title: 'Contact Us',
  description: 'Reach out to Divine Mane Naturals. Chat directly with us on WhatsApp or send us an email. Located in Chisamba Town, Zambia.',
};

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeading
        title="Get In Touch"
        subtitle="We Are Here For You"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12 items-start">
        {/* Contact Info (WhatsApp, email, address) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-primary/5 shadow-sm space-y-6">
            <h3 className="text-2xl font-serif font-bold text-primary">Contact Channels</h3>
            <p className="text-dark/75 text-sm leading-relaxed">
              We look forward to hearing from you. For product orders, customized hair recommendations, or general inquiries, use one of our channels below.
            </p>

            {/* Quick Actions */}
            <div className="space-y-4 pt-4">
              {/* On-site Order Form CTA */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-wide">On-Site Order Form</h4>
                  <p className="text-xs text-emerald-700 mt-1">Place your order directly online</p>
                </div>
                <Link
                  href="/order"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-0.5 select-none text-xs cursor-pointer"
                >
                  Order Form
                </Link>
              </div>

              {/* Phone Detail */}
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Phone / WhatsApp Reference</h4>
                  <span className="text-sm font-semibold text-dark/85 block mt-1">
                    {siteConfig.phone}
                  </span>
                </div>
              </div>

              {/* Email Detail */}
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Email Support</h4>
                  <a href={`mailto:${siteConfig.email}`} className="text-sm font-semibold text-dark/85 hover:text-secondary block mt-1 transition-colors duration-200">
                    {siteConfig.email}
                  </a>
                </div>
              </div>

              {/* Address Detail */}
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Brand HQ Address</h4>
                  <p className="text-sm font-semibold text-dark/85 mt-1 leading-snug">
                    {siteConfig.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EmailJS Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-primary/5 shadow-sm">
          <h3 className="text-2xl font-serif font-bold text-primary mb-6">Send A Message</h3>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
