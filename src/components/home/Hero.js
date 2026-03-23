'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Scissors } from 'lucide-react';
import styles from './Hero.module.css';

const HERO_SLIDES = [
    {
        img: '/images/superhero.jpg',
        title: 'Trajes de Élite',
        sub1: 'Dale vida a tus personajes',
        sub2: 'con trajes de diseño exclusivo y calidad premium.',
        cta: 'ATRÉVETE A SOÑAR'
    },
    {
        img: '/images/Disfraceschichos.png/',
        title: 'Mundo Infantil',
        sub1: 'Magia en cada aventura',
        sub2: 'disfraces increíbles y uniformes llenos de color.',
        cta: 'VER COLECCIÓN INFANTIL'
    },
    {
        img: '/images/Accesorios.png',
        title: 'Detalles Únicos',
        sub1: 'El toque final',
        sub2: 'completa tu look con nuestra colección de accesorios.',
        cta: 'EXPLORAR TODO'
    }
];

export default function Hero() {
    const [currentIdx, setCurrentIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className={styles.hero}>
            {HERO_SLIDES.map((slide, index) => (
                <div 
                    key={index} 
                    className={`${styles.bg} ${index === currentIdx ? styles.activeBg : styles.inactiveBg}`}
                >
                    {/* Assuming these images exist in public/images for local ones */}
                    <img src={slide.img} alt={`Slide publicitario ${index + 1}`} />
                </div>
            ))}

            <div className={`container ${styles.heroInner}`}>
                <div className={styles.content}>
                    <h1 className={styles.title}>{HERO_SLIDES[currentIdx].title}</h1>
                    <p className={styles.subtitle}>
                        {HERO_SLIDES[currentIdx].sub1} <br />
                        {HERO_SLIDES[currentIdx].sub2}
                    </p>
                    <Link href="#productos" className="btn btn-primary cta" style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>
                        {HERO_SLIDES[currentIdx].cta}
                    </Link>
                </div>
            </div>

            {/* Navigation Arrows (Scissors) */}
            <button 
                onClick={() => setCurrentIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} 
                className={styles.navBtn} 
                aria-label="Anterior"
            >
                <Scissors size={28} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button 
                onClick={() => setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length)} 
                className={`${styles.navBtn} ${styles.navRight}`} 
                aria-label="Siguiente"
            >
                <Scissors size={28} style={{ transform: 'rotate(360deg)' }} />
            </button>

            {/* Carousel Indicators */}
            <div className={styles.indicators}>
                {HERO_SLIDES.map((_, index) => (
                    <button 
                        key={index}
                        onClick={() => setCurrentIdx(index)}
                        className={`${styles.dot} ${index === currentIdx ? styles.activeDot : ''}`}
                        aria-label={`Ir a la diapositiva ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
