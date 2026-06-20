import React from 'react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  location?: string;
  rating?: number;
}

export default function TestimonialCard({
  quote,
  author,
  location = 'Lusaka, Zambia',
  rating = 5,
}: TestimonialCardProps) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-primary/5 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Rating Stars */}
        <div className="flex gap-1 mb-4 text-accent">
          {Array.from({ length: rating }).map((_, i) => (
            <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Testimonial Quote */}
        <blockquote className="text-dark/85 font-sans italic text-sm sm:text-base leading-relaxed mb-6">
          &ldquo;{quote}&rdquo;
        </blockquote>
      </div>

      {/* Author details */}
      <div className="border-t border-primary/5 pt-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center font-serif font-bold text-primary">
          {author.charAt(0)}
        </div>
        <div>
          <cite className="not-italic font-serif font-bold text-primary block text-sm sm:text-base">
            {author}
          </cite>
          <span className="text-xs text-dark/60 font-medium">
            {location}
          </span>
        </div>
      </div>
    </div>
  );
}
