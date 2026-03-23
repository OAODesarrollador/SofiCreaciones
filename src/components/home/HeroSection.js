'use client';

import { useState } from 'react';
import Carousel from '@/components/ui/Carousel';
import ComboModal from './ComboModal';
import stylesLayout from '@/app/PageLayout.module.css'; // Importing from shared or we move it here. 
// Assuming PageLayout.module.css is globally available via import or we duplicate styles if needed.
// Actually, I can import the specific CSS Module created earlier.

export default function HeroSection({ highlightedCombos, allCombos }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    if (!highlightedCombos || highlightedCombos.length === 0) return null;

    return (
        <div style={{ background: '#111', paddingBottom: '20px', paddingTop: '20px' }}>
            <div className="container">
                <div className={stylesLayout.wrapper}>

                    {/* Left Button */}
                    <button onClick={openModal} className={`btn btn-secondary ${stylesLayout.sideBtn} ${stylesLayout.sideBtnLeft}`}>
                        Promociones
                    </button>

                    {/* Carousel */}
                    <div style={{ minWidth: 0 }}>
                        <Carousel items={highlightedCombos} />
                    </div>

                    {/* Right Button */}
                    <button onClick={openModal} className={`btn btn-secondary ${stylesLayout.sideBtn}`}>
                        Promociones
                    </button>

                </div>
            </div>

            {/* Modal */}
            <ComboModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                combos={allCombos}
            />
        </div>
    );
}
