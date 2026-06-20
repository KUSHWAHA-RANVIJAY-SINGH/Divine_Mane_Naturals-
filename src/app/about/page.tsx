import React from 'react';
import Image from 'next/image';
import SectionHeading from '../../components/SectionHeading';
import WhyMoringaBand from '../../components/WhyMoringaBand';

export const metadata = {
  title: 'Our Story',
  description: 'Learn about Mwape Muloboko, founder of Divine Mane Naturals, and our mission to provide clean, moringa-infused hair care for textured natural hair.',
};

export default function AboutPage() {
  const values = [
    {
      title: '100% Natural Roots',
      description: 'We believe your hair deserves the best nature has to offer. We formulate without parabens, sulphates, mineral oils, or synthetic fillers.',
    },
    {
      title: 'Local Moringa Focus',
      description: 'We source high-quality Moringa Oleifera leaves directly from local Zambian farmers in Chisamba, promoting community growth and organic agriculture.',
    },
    {
      title: 'Made for Textured Hair',
      description: 'Our formulations are custom-designed for 4C, coily, curly, and transitioning hair textures, focusing on long-lasting moisture and breakage control.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Header & Intro */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <SectionHeading
          title="Rooted in Moringa, Crafted with Love"
          subtitle="Our Brand Story"
        />

        {/* Founder Story Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mt-12">
          {/* Founder Image */}
          <div className="lg:col-span-5 relative aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-lg border border-primary/5">
            <Image
              src="/lifestyle/founder-portrait.jpg"
              alt="Mwape Muloboko, Founder of Divine Mane Naturals"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-top"
            />
          </div>

          {/* Story Text */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              MEET THE FOUNDER
            </span>
            <h3 className="text-2xl font-serif font-bold text-primary">
              Founded by Mwape Muloboko
            </h3>
            <p className="text-dark/80 text-sm sm:text-base leading-relaxed">
              Divine Mane Naturals was born out of a personal struggle. For years, founder Mwape Muloboko searched for products that could nourish and manage her natural 4C hair without causing dry build-up or breakage. Finding only harsh, chemical-heavy imports on store shelves, she began researching traditional botanical remedies.
            </p>
            <p className="text-dark/80 text-sm sm:text-base leading-relaxed">
              Her search led her to the Moringa Oleifera tree, which grew abundantly in her hometown of Chisamba. When she began experimenting with cold-pressed moringa seed oils and leaf infusions, she saw a dramatic transformation. Her hair was hydrated, soft, and grew faster than ever before.
            </p>
            <p className="text-dark/80 text-sm sm:text-base leading-relaxed">
              Mwape launched Divine Mane Naturals to share these handcrafted, miracle formulas with women across Zambia. Today, we are proud to be a women-led brand operating from Chisamba Town.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Mission & Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white py-16 rounded-3xl border border-primary/5">
        <SectionHeading
          title="Our Core Values"
          subtitle="What Drives Us"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {values.map((val, idx) => (
            <div key={idx} className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary font-serif font-bold text-lg">
                {idx + 1}
              </div>
              <h4 className="text-xl font-serif font-bold text-primary">{val.title}</h4>
              <p className="text-dark/70 text-sm leading-relaxed">{val.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Reused Moringa Band */}
      <WhyMoringaBand />

      {/* 4. Lifestyle Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Celebrate Your Crown"
          subtitle="Our Community"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((num) => (
            <div key={num} className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-sm hover:scale-[1.02] transition-transform duration-300">
              <Image
                src={`/lifestyle/lifestyle-${num}.jpg`}
                alt={`Divine Mane Naturals Community ${num}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
