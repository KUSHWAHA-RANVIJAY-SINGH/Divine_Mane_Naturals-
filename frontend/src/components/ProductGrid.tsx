import React from 'react';
import { Product } from '../lib/api';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const categories = [
    { key: 'Cleanse', title: 'Cleanse & Refresh', subtitle: 'Step 1: Cleanse' },
    { key: 'Condition & Repair', title: 'Condition & Repair', subtitle: 'Step 2: Hydrate & Strengthen' },
    { key: 'Moisturize', title: 'Moisturize & Lock', subtitle: 'Step 3: Seal Moisture' },
    { key: 'Growth & Finish', title: 'Growth & Finish', subtitle: 'Step 4: Nourish & Style' },
  ];

  // Group products by category key
  const getProductsByCategory = (category: string) => {
    return products.filter((p) => p.category === category);
  };

  return (
    <div className="space-y-16">
      {categories.map((category) => {
        const categoryProducts = getProductsByCategory(category.key);

        // Skip category if it has no products
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category.key} className="scroll-mt-24">
            {/* Category Header */}
            <div className="border-b border-primary/10 pb-4 mb-8">
              <span className="text-[10px] font-bold tracking-widest text-secondary uppercase block mb-1">
                {category.subtitle}
              </span>
              <h3 className="font-serif font-bold text-2xl sm:text-3xl text-primary">
                {category.title}
              </h3>
            </div>

            {/* Product Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryProducts.map((product) => (
                <div key={product._id} className="animate-slide-up">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
