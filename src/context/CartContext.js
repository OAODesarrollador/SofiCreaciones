'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('cart');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) { console.error('Failed to parse cart', e); }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product, isCombo = false) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id && i.isCombo === isCombo);
            if (existing) {
                return prev.map(i =>
                    (i.id === product.id && i.isCombo === isCombo)
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { ...product, isCombo, quantity: 1 }];
        });
        setIsOpen(true);
    };

    const removeFromCart = (id, isCombo) => {
        setItems(prev => prev.filter(i => !(i.id === id && i.isCombo === isCombo)));
    };

    const updateQuantity = (id, isCombo, delta) => {
        setItems(prev => prev.map(i => {
            if (i.id === id && i.isCombo === isCombo) {
                const newQty = i.quantity + delta;
                return newQty > 0 ? { ...i, quantity: newQty } : i;
            }
            return i;
        }));
    };

    const clearCart = () => setItems([]);

    const total = items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, count, isOpen, setIsOpen }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
