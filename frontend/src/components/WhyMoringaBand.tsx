import React from 'react';
import SectionHeading from './SectionHeading';

export default function WhyMoringaBand() {
  const benefits = [
    {
      title: 'Strengthens Hair Follicles',
      description: 'Moringa contains zinc, iron, and essential amino acids that deliver key nutrients to hair follicles, fortifying strands from root to tip.',
      icon: (
        <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Hydrates and Moisturizes',
      description: 'Enriched with oleic acid (omega-9 fatty acid), moringa locks in deep moisture for coarse, textured, or curly hair without greasy residue.',
      icon: (
        <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
    {
      title: 'Protects from Environmental Damage',
      description: 'High levels of vitamin C, vitamin E, and antioxidants shield hair from pollution, dust, and harsh sunlight.',
      icon: (
        <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-primary text-white py-20 relative overflow-hidden">
      {/* Decorative leaf background pattern */}
      <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
        <svg className="w-96 h-96 fill-current text-white" viewBox="0 0 24 24">
          <path d="M17 8C8 8 4 16 4 22h2c0-4 3-8 11-8v8h2v-8c3 0 5 2 5 6h2c0-5.5-4.5-10-10-10z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          title="The Miracle of Moringa"
          subtitle="Our Signature Ingredient"
          inverse={true}
        />

        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-white/90 text-base sm:text-lg leading-relaxed">
            Every product in the Divine Mane Naturals range is infused with pure, locally sourced Zambian Moringa. Known as the &quot;Miracle Tree,&quot; moringa leaves contain 90+ nutrients, 46 antioxidants, and all 9 essential amino acids to revitalize dry, damaged, and transitioning textured hair.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="bg-primary-dark/40 border border-primary-light/10 p-8 rounded-2xl hover:border-secondary/40 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-primary-dark/80 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-3">
                {benefit.title}
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
