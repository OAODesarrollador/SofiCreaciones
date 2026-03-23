'use client';

import { useState, useEffect } from 'react';
import styles from './Carousel.module.css';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export default function Carousel({ items }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { addToCart } = useCart();

    const getImgSrc = (src) => {
        const raw = src || '/images/Logo.jpg';
        try {
            const u = new URL(raw, 'http://localhost');
            if (u.hostname && (u.hostname.includes('drive.google.com') || u.hostname.includes('lh3.googleusercontent.com'))) {
                return `/api/image/proxy?url=${encodeURIComponent(raw)}`;
            }
        } catch {
            // Keep original src if URL parsing fails
        }
        return raw;
    };

    const goToNextSlide = () => {
        setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    };

    const goToPrevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    };

    // Auto-play
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
        }, 4000);

        return () => clearInterval(timer);
    }, [items.length]);

    if (!items || items.length === 0) return null;

    return (
        <div className={styles.carouselContainer}>
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
                >
                    {/* Left Column: Image */}
                    <div className={styles.imageSide}>
                        <img src={getImgSrc(item.imagen)} alt={item.nombre} className={styles.image} />
                    </div>

                    {/* Right Column: Text */}
                    <div className={styles.contentSide}>
                        <h2 className={styles.title}>{item.nombre}</h2>
                        <p className={styles.description}>
                            {item.items || item.descripcion}
                        </p>

                        <div className={styles.actionRow}>
                            <span className={styles.price}>{formatPrice(item.precio)}</span>
                            <button
                                className="btn btn-primary"
                                onClick={() => addToCart(item, true)}
                                style={{ fontSize: '1.1rem', padding: '12px 24px' }}
                            >
                                Agregar Pedido
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                className={`${styles.arrow} ${styles.arrowLeft}`}
                onClick={goToPrevSlide}
                aria-label="Imagen anterior"
            >
                &#10094;
            </button>

            <button
                type="button"
                className={`${styles.arrow} ${styles.arrowRight}`}
                onClick={goToNextSlide}
                aria-label="Imagen siguiente"
            >
                &#10095;
            </button>

            <div className={styles.controls}>
                {items.map((_, idx) => (
                    <div
                        key={idx}
                        className={`${styles.dot} ${idx === currentIndex ? styles.active : ''}`}
                        onClick={() => setCurrentIndex(idx)}
                    />
                ))}
            </div>
        </div>
    );
}

