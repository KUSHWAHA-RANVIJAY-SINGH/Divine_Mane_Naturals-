import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Hero from '../components/Hero';
import WhyMoringaBand from '../components/WhyMoringaBand';
import ProductCard from '../components/ProductCard';
import TestimonialCard from '../components/TestimonialCard';
import WhatsAppButton from '../components/WhatsAppButton';
import SectionHeading from '../components/SectionHeading';
import { getProducts } from '../lib/api';
import localProducts from '../data/products.json';

// Make page dynamic
export const revalidate = 60;

export default async function HomePage() {
  let products: any[] = [];
  let isApiFallback = false;

  try {
    const apiProducts = await getProducts();
    // Use first 3 products as featured
    products = apiProducts.slice(0, 3);
  } catch (error) {
    console.warn('⚠️ Product API offline, falling back to local JSON data:', error);
    // Format local JSON structure to match Product interface (add fake IDs)
    products = localProducts.slice(0, 3).map((p, idx) => ({
      _id: `fallback-${idx}`,
      ...p,
      category: p.category as 'Cleanse' | 'Condition & Repair' | 'Moisturize' | 'Growth & Finish',
    }));
    isApiFallback = true;
  }


  const testimonials = [
    {
      quote: "My hair has never felt so soft! The Choco-Mint Butter Cream is a game changer for my dry curls.",
      author: "Chipo Mwansa",
      location: "Chisamba, Zambia",
    },
    {
      quote: "I was struggling with severe breakage. After 3 weeks of using the Protein Deep Conditioner, my hair is visibly stronger.",
      author: "Namakau Phiri",
      location: "Lusaka, Zambia",
    },
    {
      quote: "The Hair Growth Oil smells amazing and actually works. I'm seeing new growth along my edges!",
      author: "Mutale Kabwe",
      location: "Ndola, Zambia",
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Best Sellers"
          subtitle="Featured Favorites"
        />

        {isApiFallback && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl text-center max-w-md mx-auto">
            ℹ️ Viewing demo data. Start the backend API to manage products.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 font-serif font-bold text-primary hover:text-secondary tracking-wide border-b-2 border-secondary pb-1 transition-all duration-300"
          >
            View All Products
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* 3. Why Moringa Band */}
      <WhyMoringaBand />

      {/* 4. Brand Story Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white py-16 rounded-3xl border border-primary/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative aspect-square w-full rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/lifestyle/lifestyle-1.jpg"
              alt="Natural Hair Confidence"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              Handcrafted in Zambia
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary">
              Our Journey to Healthy Hair
            </h2>
            <p className="text-dark/80 text-sm sm:text-base leading-relaxed">
              Founded by Mwape Muloboko in Chisamba Town, Divine Mane Naturals was born from a passion for organic, ingredient-focused hair care. Disappointed by chemical-laden imports, Mwape turned to local Zambian flora — namely the Moringa Oleifera tree — to formulate deep nourishment for textured, coily, and transitioning natural hair.
            </p>
            <p className="text-dark/80 text-sm sm:text-base leading-relaxed">
              Every jar and bottle is made using clean, plant-based ingredients that respect your hair and the environment.
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 font-serif font-bold text-primary hover:text-secondary tracking-wide border-b-2 border-secondary pb-1 transition-all duration-300"
              >
                Read Our Full Story
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Social Proof / Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Mane Love stories"
          subtitle="Real Results from Real Women"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <TestimonialCard
              key={idx}
              quote={t.quote}
              author={t.author}
              location={t.location}
            />
          ))}
        </div>

        {/* Gallery grid of lifestyle photos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
          {[1, 2, 3].map((num) => (
            <div key={num} className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-sm hover:scale-[1.02] transition-transform duration-300">
              <Image
                src={`/lifestyle/lifestyle-${num}.jpg`}
                alt={`Divine Mane Naturals Lifestyle ${num}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 6. CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary text-white p-10 sm:p-16 rounded-3xl text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-light/20 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
              Ready to Transform Your Hair Routine?
            </h2>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Order directly via WhatsApp and receive a personalized recommendation based on your hair type. Fast delivery across Chisamba and Lusaka.
            </p>
            <div className="pt-4">
              <WhatsAppButton
                message="Hi! I want to try Divine Mane Naturals products. Can you help me choose the right ones for my hair?"
                className="!px-8 !py-4 text-base bg-secondary hover:bg-secondary-light !text-primary font-serif font-bold shadow-2xl hover:shadow-secondary/20"
              >
                Chat & Order on WhatsApp
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
