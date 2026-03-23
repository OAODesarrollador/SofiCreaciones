import { fetchCatalog } from '@/lib/catalog';
import ProductGrid from '@/components/home/ProductGrid';
import CartDrawer from '@/components/business/CartDrawer';
import Hero from '@/components/home/Hero';
import { CategoryBubbles, PromoBanner, IconGrid, FeatureGrid, CategoryTiles, NewsletterBar, Testimonials } from '@/components/home/HomeSections';

// Revalidate every minute
export const revalidate = 60;

export default async function Home({ searchParams }) {
  const { products } = await fetchCatalog();
  const categoria = searchParams?.categoria || 'Todos';

  return (
    <>
      <div style={{ marginTop: '0' }}>
        <Hero />
      </div>

      <div style={{ padding: '20px 0' }}>
        <CategoryBubbles />
      </div>

      <PromoBanner />
      <IconGrid />
      <FeatureGrid />
      <CategoryTiles />

      {/* Tabbed Product Showcase */}
      <div className="container" style={{ paddingBottom: '40px', marginTop: '60px' }}>
        <section id="productos" style={{ marginTop: '0' }}>
          <ProductGrid items={products} isCombo={false} initialFilter={categoria} />
        </section>
      </div>

      <NewsletterBar />
      <Testimonials />
      
      <CartDrawer />
    </>
  );
}
