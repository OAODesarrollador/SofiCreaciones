'use client';

import { useState, useEffect } from 'react';
import styles from './ProductEditor.module.css';

export default function ProductEditor({ product = null, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: 'UNIFORMES',
        imagen: '',
        disponible: true,
        orden: 99
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const defaultCategories = ['DISFRACES', 'UNIFORMES', 'ACCESORIOS', 'CALZADO', 'EXTRAS'];
    const [categories, setCategories] = useState(defaultCategories);

    // Cargar datos del producto si es edición
    useEffect(() => {
        if (product) {
            setFormData({
                nombre: product.nombre || '',
                descripcion: product.descripcion || '',
                precio: product.precio || '',
                categoria: product.categoria || 'UNIFORMES',
                imagen: product.imagen || '',
                disponible: product.disponible !== false,
                orden: product.orden || 99
            });
        }
    }, [product]);

    // Obtener categorías desde la API (admin)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/admin/categories');
                if (!res.ok) return; // mantener por defecto
                const data = await res.json();
                if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                    setCategories(data.data);
                }
            } catch (err) {
                // no hacer nada, usar categorías por defecto
            }
        };
        fetchCategories();
    }, []);

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }
        if (!formData.precio || isNaN(formData.precio) || formData.precio < 0) {
            newErrors.precio = 'El precio debe ser válido';
        }
        if (!formData.categoria.trim()) {
            newErrors.categoria = 'La categoría es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const method = product ? 'PATCH' : 'POST';
            const payload = product 
                ? { id: product.id, ...formData }
                : formData;

            const response = await fetch('/api/admin/products', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar producto');
            }

            setMessage(product ? 'Producto actualizado' : 'Producto creado');
            if (onSave) {
                onSave();
            }
            
            // Limpiar formulario si es crear
            if (!product) {
                setFormData({
                    nombre: '',
                    descripcion: '',
                    precio: '',
                    categoria: 'UNIFORMES',
                    imagen: '',
                    disponible: true,
                    orden: 99
                });
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.editor}>
            <h2>{product ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>

            {message && (
                <div className={`${styles.message} ${message.includes('Error') ? styles.error : styles.success}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="nombre">Nombre *</label>
                    <input
                        id="nombre"
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Chaqueta Médica Azul"
                        maxLength="100"
                    />
                    {errors.nombre && <span className={styles.error}>{errors.nombre}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="descripcion">Descripción</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        placeholder="Ej: Chaqueta entallada con triple costura"
                        maxLength="500"
                        rows="3"
                    />
                    <small>{formData.descripcion.length}/500</small>
                    {errors.descripcion && <span className={styles.error}>{errors.descripcion}</span>}
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="precio">Precio ($) *</label>
                        <input
                            id="precio"
                            type="number"
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                        />
                        {errors.precio && <span className={styles.error}>{errors.precio}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="categoria">Categoría *</label>
                        <select
                            id="categoria"
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChange}
                        >
                            {categories.map((c) => (
                                <option value={c} key={c}>{c}</option>
                            ))}
                        </select>
                        {errors.categoria && <span className={styles.error}>{errors.categoria}</span>}
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="orden">Orden de Presentación</label>
                        <input
                            id="orden"
                            type="number"
                            name="orden"
                            value={formData.orden}
                            onChange={handleChange}
                            min="0"
                            max="999"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="imagen">URL de Imagen</label>
                        <input
                            id="imagen"
                            type="text"
                            name="imagen"
                            value={formData.imagen}
                            onChange={handleChange}
                            placeholder="/images/producto.jpg"
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>
                        <input
                            type="checkbox"
                            name="disponible"
                            checked={formData.disponible}
                            onChange={handleChange}
                        />
                        <span>Disponible</span>
                    </label>
                </div>

                <div className={styles.actions}>
                    <button type="submit" disabled={loading} className={`btn btn-primary ${styles.submitBtn}`}>
                        {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
                    </button>
                    {onCancel && (
                        <button type="button" onClick={onCancel} className={`btn btn-secondary ${styles.cancelBtn}`}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
