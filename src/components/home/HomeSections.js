'use client';

import Link from 'next/link';
import { Star, Truck, ShieldCheck, HelpCircle } from 'lucide-react';
import styles from './HomeSections.module.css';

export function CategoryBubbles() {
    const bubbles = [
        { name: 'Disfraces', img: '/images/DisfracesBoton.jpg' },
        { name: 'Maquillajes', img: '/images/MaquillajeBoton.webp' },
        { name: 'Máscaras', img: '/images/MascarasBoton.webp' },
        { name: 'Pelucas', img: '/images/PelucasBoton.jpg' },
        { name: 'Accesorios', img: '/images/AccesoriosBoton.jpg' },
        { name: 'Uniformes', img: '/images/UniformesBoton.webp' },
    ];
    return (
        <section className={`container ${styles.section}`}>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Explora Nuestras Colecciones Mágicas</h2>
            <div className={styles.bubbleGrid}>
                {bubbles.map((b, i) => (
                    <Link href={`/?categoria=${b.name}#productos`} key={i} className={styles.bubble} style={{ textDecoration: 'none' }}>
                        <div className={styles.bubbleImageWrapper}>
                            <img src={b.img} alt={b.name} className={styles.bubbleImage} />
                        </div>
                        <p className={styles.bubbleText}>{b.name}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export function PromoBanner() {
    return (
        <section className={`container ${styles.section}`}>
            <div className={styles.promoBanner}>
                <h2>✨ TEMPORADA DE MAGIA: OBTÉN 15% OFF EN TU PRIMER DISFRAZ O UNIFORME ✨</h2>
            </div>
        </section>
    );
}

export function IconGrid() {
    const icons = [
        { Icon: Truck, title: 'Envíos a Todo el País', desc: 'Llevamos la magia hasta la puerta de tu casa.' },
        { Icon: ShieldCheck, title: 'Calidad Premium', desc: 'Telas y terminaciones diseñadas para soportar la diversión.' },
        { Icon: Star, title: 'Atención Personalizada', desc: 'Te ayudamos a encontrar la talla y el look perfecto.' },
        { Icon: HelpCircle, title: 'Compras Seguras', desc: 'Transacciones 100% protegidas, fáciles y rápidas.' },
    ];
    return (
        <section className={`container ${styles.section}`}>
            <div className={styles.iconGrid}>
                {icons.map((item, i) => (
                    <div key={i} className={styles.iconCard}>
                        <item.Icon size={48} color="var(--primary)" className={styles.iconSVG} />
                        <h3 className={styles.iconTitle}>{item.title}</h3>
                        <p className={styles.iconDesc}>{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function FeatureGrid() {
    // 💡 Aquí puedes cambiar las imágenes y textos de las Tarjetas Gigantes fácilmente
    const features = {
        left: { img: '/images/Maquillaje.png', title: 'EFECTOS Y MAQUILLAJE', btnText: 'Deslumbrar', link: '#productos' },
        middleTop: { img: '/images/RegalaMagia.jpg', title: 'Regala Magia' },
        middleBottom: { img: '/images/IdeaseIspiracion.webp', title: 'Ideas e Inspiración' },
        right: { img: '/images/UniformesdeGala.png', title: 'UNIFORMES DE GALA', btnText: 'Explorar', link: '#productos' }
    };

    return (
        <section className={`container ${styles.section}`}>
            <div className={styles.featureGrid}>
                {/* Panel Izquierdo */}
                <div className={`${styles.featureItem} ${styles.featureLeft}`} style={{ background: `url('${features.left.img}') center/cover` }}>
                    <h3 className={styles.bgLabel}>{features.left.title}</h3>
                    <Link href={features.left.link} className="btn btn-secondary">{features.left.btnText}</Link>
                </div>
                
                {/* Panel Central */}
                <div className={styles.featureMiddle}>
                    <div className={`${styles.featureItem} ${styles.featureStacked1}`} style={{ background: `url('${features.middleTop.img}') center/cover` }}>
                        <h3 className={styles.bgLabel}>{features.middleTop.title}</h3>
                    </div>
                    <div className={`${styles.featureItem} ${styles.featureStacked2}`} style={{ background: `url('${features.middleBottom.img}') center/cover` }}>
                        <h3 className={styles.bgLabel}>{features.middleBottom.title}</h3>
                    </div>
                </div>
                
                {/* Panel Derecho */}
                <div className={`${styles.featureItem} ${styles.featureRight}`} style={{ background: `url('${features.right.img}') center/cover` }}>
                    <h3 className={styles.bgLabel}>{features.right.title}</h3>
                    <Link href={features.right.link} className="btn btn-secondary">{features.right.btnText}</Link>
                </div>
            </div>
        </section>
    );
}

export function CategoryTiles() {
    return (
        <section className={`container ${styles.section}`}>
            <div className={styles.categoryTiles}>
                <div className={styles.tile}>
                    <img src="/images/PelucasBoton.jpg  " alt="Wigs" />
                    <div className={styles.tileLabel}>PELUCAS</div>
                </div>
                <div className={styles.tile}>
                    <img src="/images/MaquillajeBoton.webp" alt="Makeup" />
                    <div className={styles.tileLabel}>MAQUILLAJE</div>
                </div>
                <div className={styles.tile}>
                    <img src="/images/CapasBoton.jpg" alt="Capes" />
                    <div className={styles.tileLabel}>CAPAS Y TÚNICAS</div>
                </div>
            </div>
        </section>
    );
}

export function NewsletterBar() {
    return (
        <section className={styles.newsletterSection}>
            <div className={`container ${styles.newsletterInner}`}>
                <div className={styles.newsletterText}>
                    <h2>Únete a nuestro club vip y recibe ofertas mágicas</h2>
                    <p>Déjanos tu correo y entérate antes que nadie de los últimos diseños, sorteos y descuentos especiales.</p>
                </div>
                <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
                    <input type="email" placeholder="Ingresa tu correo personal" required className={styles.newsletterInput} />
                    <button type="submit" className="btn btn-primary" style={{ borderRadius: '0', background: 'white', color: 'var(--primary)', fontWeight: '800' }}>¡QUIERO MAGIA!</button>
                </form>
            </div>
        </section>
    );
}

export function Testimonials() {
    return (
        <section className={`container ${styles.section}`}>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Por Qué Nos Eligen</h2>
            <div className={styles.testimonialContainer}>
                <div className={styles.testimonialContent}>
                    <div className={styles.stars}>★★★★★</div>
                    <p className={styles.review}>"Los disfraces de Sofi Creaciones son increíbles. La atención al detalle y la calidad de las telas superaron totalmente mis expectativas. ¡Mi hijo fue el más feliz de su cumpleaños!"</p>
                    <p className={styles.author}>- Laura M., Clienta Frecuente</p>
                </div>
            </div>
        </section>
    );
}
