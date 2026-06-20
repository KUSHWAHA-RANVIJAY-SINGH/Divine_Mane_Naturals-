import React from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  inverse?: boolean;
}

export default function SectionHeading({
  title,
  subtitle,
  centered = true,
  inverse = false,
}: SectionHeadingProps) {
  return (
    <div className={`mb-12 max-w-3xl ${centered ? 'mx-auto text-center' : 'text-left'}`}>
      {subtitle && (
        <span className={`text-xs font-bold uppercase tracking-[0.2em] block mb-2 ${
          inverse ? 'text-secondary-light' : 'text-secondary'
        }`}>
          {subtitle}
        </span>
      )}
      <h2 className={`text-3xl sm:text-4xl font-serif font-bold tracking-tight mb-4 ${
        inverse ? 'text-white' : 'text-primary'
      }`}>
        {title}
      </h2>
      <div className={`h-1 w-20 rounded-full ${
        centered ? 'mx-auto' : ''
      } ${
        inverse ? 'bg-secondary-light' : 'bg-secondary'
      }`} />
    </div>
  );
}
