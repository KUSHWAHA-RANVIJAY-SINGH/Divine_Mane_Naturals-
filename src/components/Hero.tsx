import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <div className="relative bg-brand-bg overflow-hidden py-16 sm:py-24 lg:py-32">
      {/* Background Graphic Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 rounded-l-[100px] pointer-events-none hidden lg:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-wider animate-fade-in">
              🌿 Infused with Zambia&apos;s Miracle Moringa
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-primary tracking-tight leading-tight sm:leading-none">
              Natural Hair Care, <br />
              <span className="text-secondary italic">Rooted in Moringa</span>
            </h1>

            <p className="text-dark/80 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Experience the power of nature. Our premium Moringa-infused formulas cleanse, condition, moisturize, and promote growth for stunning, textured curls. Handcrafted in Chisamba Town.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/shop"
                className="px-8 py-4 bg-primary text-white font-serif font-bold text-base rounded-full hover:bg-primary-light transition-all duration-300 shadow-md hover:shadow-primary/20 text-center"
              >
                Shop Our Products
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 bg-transparent border-2 border-primary text-primary font-serif font-bold text-base rounded-full hover:bg-primary/5 transition-all duration-300 text-center"
              >
                Our Ingredient Story
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end animate-slide-up">
            <div className="relative w-full max-w-md sm:max-w-lg aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white/60">
              <Image
                src="/lifestyle/founder-portrait.jpg"
                alt="Mwape Muloboko, Founder of Divine Mane Naturals"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top"
              />
              {/* Glassmorphic card overlay */}
              <div className="absolute bottom-6 left-6 right-6 glass p-6 rounded-2xl border border-white/20 shadow-lg text-left hidden sm:block">
                <span className="text-[10px] font-bold text-secondary tracking-widest uppercase block mb-1">
                  Founder&apos;s Mission
                </span>
                <p className="text-xs sm:text-sm font-sans font-medium text-dark/95 leading-relaxed">
                  &ldquo;Divine Mane Naturals was born out of a desire to see textured hair thrive. We formulate with local Zambian Moringa to restore natural strength and glow.&rdquo;
                </p>
                <cite className="block text-[11px] font-serif font-bold text-primary mt-2 not-italic">
                  — Mwape Muloboko
                </cite>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
