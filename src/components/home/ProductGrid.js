'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import styles from './ProductGrid.module.css';

export default function ProductGrid({ items, isCombo, initialFilter = 'Todos' }) {
    const [filter, setFilter] = useState(initialFilter);

    useEffect(() => {
        setFilter(initialFilter);
    }, [initialFilter]);
    const categories = ['Todos', ...new Set(items.map(i => i.categoria).filter(Boolean))];

    const visible = filter === 'Todos' ? items : items.filter(i => i.categoria === filter);

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <h3 className={styles.sidebarTitle}>Explorar Tienda</h3>
                <ul className={styles.sidebarList}>
                    {categories.map(c => (
                        <li key={c}>
                            <button
                                onClick={() => setFilter(c)}
                                className={`${styles.sidebarBtn} ${filter === c ? styles.activeSidebarBtn : ''}`}
                            >
                                {c}
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>
            <div className={styles.mainContent}>
                <div className={styles.grid}>
                    {visible.map(item => (
                        <ProductCard key={item.id} item={item} isCombo={isCombo} />
                    ))}
                </div>
            </div>
        </div>
    );
}
