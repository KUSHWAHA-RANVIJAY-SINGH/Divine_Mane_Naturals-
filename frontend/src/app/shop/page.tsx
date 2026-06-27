import React from 'react';
import ProductGrid from '../../components/ProductGrid';
import SectionHeading from '../../components/SectionHeading';
import { getProducts } from '../../lib/api';

export const revalidate = 0;

export const metadata = {
  title: 'Shop Catalog',
  description: 'Explore the full range of Divine Mane Naturals products: gentle cleansing shampoo, protein deep conditioners, castor oil, and hair growth oils.',
};

export default async function ShopPage() {
  let products: any[] = [];

  try {
    products = await getProducts();
  } catch (error) {
    console.error('Error fetching products:', error);
  }


  return (
    <div id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeading
        title="Product Catalog"
        subtitle="Natural &amp; Organic Hair Care"
      />

      <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
        <p className="text-dark/80 text-sm sm:text-base leading-relaxed">
          Nourish your curls with our organic, locally-sourced formulations. We group our products into 4 easy steps: Cleanse, Condition, Moisturize, and Growth &amp; Finish.
        </p>
        {products.length === 0 && (
          <div className="inline-block p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl">
            ⚠️ Could not load products. Please check if the backend API is running.
          </div>
        )}
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
