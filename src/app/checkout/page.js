import { Suspense } from 'react';
import { fetchCatalog } from '@/lib/catalog';
import CheckoutForm from '@/components/business/CheckoutForm';

export const metadata = {
    title: 'Checkout - Urban Costume',
};

// Don't cache this page aggressively, in case config changes
export const revalidate = 60;

export default async function Page() {
    const { config } = await fetchCatalog();

    return (
        <div className="container">
            <Suspense fallback={<div>Cargando checkout...</div>}>
                <CheckoutForm whatsappNumber={config?.whatsapp} />
            </Suspense>
        </div>
    );
}
