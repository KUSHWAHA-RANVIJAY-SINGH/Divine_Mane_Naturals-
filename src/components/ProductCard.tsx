import React from 'react';
import Image from 'next/image';
import { Product } from '../lib/api';
import WhatsAppButton from './WhatsAppButton';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formattedPrice =
    product.price !== null && product.price !== undefined
      ? `ZK ${product.price.toFixed(2)}`
      : 'Contact for price';

  const orderMessage = `Hi! I'd like to order the Divine Mane Naturals ${product.name}.`;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-primary/5 hover:border-primary/10 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Product Image Wrapper */}
      <div className="relative aspect-square w-full bg-brand-bg overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          priority={false}
        />
        {/* Category Tag */}
        <span className="absolute top-4 left-4 text-[10px] font-bold tracking-widest uppercase bg-primary text-white px-2.5 py-1 rounded-full shadow-sm">
          {product.category}
        </span>
      </div>

      {/* Product Details */}
      <div className="p-6 flex flex-col justify-between flex-grow">
        <div>
          {product.tagline && (
            <span className="text-[11px] font-bold text-secondary tracking-wider uppercase block mb-1">
              {product.tagline}
            </span>
          )}
          <h3 className="font-serif font-bold text-lg sm:text-xl text-primary mb-2 line-clamp-1 group-hover:text-primary-light transition-colors duration-200">
            {product.name}
          </h3>
          <p className="text-dark/70 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2">
            {product.benefit}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-4 border-t border-primary/5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="text-xs font-bold text-dark/50 uppercase tracking-wider">
              Price
            </span>
            <span className="font-sans font-bold text-sm sm:text-base text-primary">
              {formattedPrice}
            </span>
          </div>

          <WhatsAppButton
            message={orderMessage}
            className="w-full text-center py-2.5 text-xs sm:text-sm !rounded-xl"
          >
            Order on WhatsApp
          </WhatsAppButton>
        </div>
      </div>
    </div>
  );
}
