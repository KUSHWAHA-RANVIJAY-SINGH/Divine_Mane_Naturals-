import React from 'react';
import ProductGrid from '../../components/ProductGrid';
import SectionHeading from '../../components/SectionHeading';
import { getProducts } from '../../lib/api';
import localProducts from '../../data/products.json';

export const revalidate = 60;

export const metadata = {
  title: 'Shop Catalog',
  description: 'Explore the full range of Divine Mane Naturals products: gentle cleansing shampoo, protein deep conditioners, castor oil, and hair growth oils.',
};

export default async function ShopPage() {
  let products: any[] = [];
  let isApiFallback = false;

  try {
    products = await getProducts();
  } catch (error) {
    console.warn('⚠️ Product API offline, falling back to local JSON data:', error);
    // Format local JSON structure to match Product interface (add fake IDs)
    products = localProducts.map((p, idx) => ({
      _id: `fallback-${idx}`,
      ...p,
      category: p.category as 'Cleanse' | 'Condition & Repair' | 'Moisturize' | 'Growth & Finish',
    }));
    isApiFallback = true;
  }


  return (
    <div id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeading
        title="Product Catalog"
        subtitle="Moringa-Infused Hair Care"
      />

      <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
        <p className="text-dark/80 text-sm sm:text-base leading-relaxed">
          Nourish your curls with our organic, Zambian Moringa formulations. We group our products into 4 easy steps: Cleanse, Condition, Moisturize, and Growth &amp; Finish.
        </p>
        {isApiFallback && (
          <div className="inline-block p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
            ℹ️ Viewing demo data. Start the backend API to manage products.
          </div>
        )}
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
