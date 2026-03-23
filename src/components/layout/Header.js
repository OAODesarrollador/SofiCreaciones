'use client';

import Link from 'next/link';
import { ShoppingCart, Search, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './Header.module.css';

export default function Header() {
    const { count, setIsOpen } = useCart();

    return (
        <header className={styles.header}>
            {/* Top Bar */}
            <div className={styles.topBar}>
                <span>ENVÍO GRATIS EN COMPRAS SUPERIORES A $50.000</span>
            </div>

            {/* Main Header */}
            <div className={`container ${styles.mainHeader}`}>
                <Link href="/" className={styles.logo}>


                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/images/soficreaciones.png" alt="Sofi Creaciones" style={{ height: '45px', width: 'auto' }} />
                        <span className="texto-sofi">Sofi Creaciones</span>
                    </div>
                </Link>

                <div className={styles.searchContainer}>
                    <input type="text" placeholder="Buscar productos..." className={styles.searchInput} />
                    <button className={styles.searchBtn} aria-label="Buscar"><Search size={20} /></button>
                </div>

                <div className={styles.actions}>
                    <button className={`btn btn-ghost ${styles.iconBtn}`} aria-label="Cuenta">
                        <User size={24} />
                    </button>
                    <button
                        className={`btn btn-ghost ${styles.iconBtn} ${styles.cartBtn}`}
                        onClick={() => setIsOpen(true)}
                        aria-label="Abrir carrito"
                    >
                        <ShoppingCart size={24} />
                        {count > 0 && <span className={styles.badge}>{count}</span>}
                    </button>
                </div>
            </div>

            {/* Bottom Nav */}
            <div className={styles.bottomNav}>
                <div className={`container ${styles.navLinks}`}>
                    <Link href="/?categoria=Disfraces#productos">Disfraces</Link>
                    <Link href="/?categoria=Uniformes#productos">Uniformes</Link>
                    <Link href="/?categoria=Accesorios#productos">Accesorios</Link>
                    <Link href="/?categoria=Maquillaje#productos">Maquillaje</Link>
                    <Link href="/?categoria=Pelucas#productos">Pelucas</Link>
                </div>
            </div>
        </header>
    );
}
