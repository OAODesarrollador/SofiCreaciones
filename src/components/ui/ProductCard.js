'use client';

import { useCart } from '@/context/CartContext';
import styles from './ProductCard.module.css';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';

export default function ProductCard({ item, isCombo = false }) {
    const { addToCart } = useCart();

    const handleAdd = () => {
        addToCart(item, isCombo);
    };

    const getImgSrc = () => {
        const src = item.imagen || 'https://dummyimage.com/300x400/1F2937/8B5CF6.png&text=Urban+Costume';
        try {
            const u = new URL(src, 'http://localhost');
            if (u.hostname && (u.hostname.includes('drive.google.com') || u.hostname.includes('lh3.googleusercontent.com'))) {
                return `/api/image/proxy?url=${encodeURIComponent(src)}`;
            }
        } catch (e) {
            // keep original
        }

        return src;
    };

    return (
        <article className={styles.card}>
            <div className={styles.imageContainer}>
                {/* Use standard img for simplicity with external URLs or local */}
                <img
                    src={getImgSrc()}
                    alt={item.nombre}
                    className={styles.image}
                    loading="lazy"
                />
            </div>
            <div className={styles.content}>
                <div className={styles.row}>
                    <h3 className={styles.title}>{item.nombre}</h3>
                    <span className={styles.price}>{formatPrice(item.precio)}</span>
                </div>
                <p className={styles.description}>
                    {isCombo ? item.items : item.descripcion}
                </p>
                <div className={styles.actions}>
                    <button
                        className={`btn btn-primary ${styles.addButton}`}
                        onClick={handleAdd}
                        disabled={!item.disponible && !isCombo} // Combos assumed available unless logic added
                    >
                        <ShoppingBag size={18} />
                        {item.disponible !== false ? 'Comprar ahora' : 'Sin Stock'}
                    </button>
                </div>
            </div>
        </article>
    );
}
