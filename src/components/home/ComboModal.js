'use client';

import { X } from 'lucide-react';
import ProductGrid from './ProductGrid';
import styles from './ComboModal.module.css';
import { useEffect } from 'react';

export default function ComboModal({ isOpen, onClose, combos }) {
    // Prevent scrolling body when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Nuestros Combos</h2>
                    <button className={`btn btn-secondary ${styles.closeBtn}`} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.content}>
                    <ProductGrid items={combos} isCombo={true} />
                </div>
            </div>
        </div>
    );
}
