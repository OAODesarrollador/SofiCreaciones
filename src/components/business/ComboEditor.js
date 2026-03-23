'use client';

import { useEffect, useState } from 'react';
import styles from './ComboEditor.module.css';

export default function ComboEditor({ combo = null, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        descripcion: '',
        items: '',
        precio: '',
        imagen: '',
        destacado: false
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (combo) {
            setFormData({
                id: combo.id || '',
                nombre: combo.nombre || '',
                descripcion: combo.descripcion || '',
                items: combo.items || '',
                precio: combo.precio ?? '',
                imagen: combo.imagen || '',
                destacado: combo.destacado === true
            });
        }
    }, [combo]);

    const validateForm = () => {
        const newErrors = {};
        if (!combo && !formData.id.trim()) {
            newErrors.id = 'El ID es requerido';
        }
        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }
        if (formData.precio === '' || isNaN(formData.precio) || Number(formData.precio) < 0) {
            newErrors.precio = 'El precio debe ser válido';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setMessage('');

        try {
            const method = combo ? 'PATCH' : 'POST';
            const payload = combo
                ? { id: combo.id, ...formData }
                : formData;

            const response = await fetch('/api/admin/combos', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar combo');
            }

            setMessage(combo ? 'Promoción actualizada' : 'Promoción creada');
            if (onSave) onSave();

            if (!combo) {
                setFormData({
                    id: '',
                    nombre: '',
                    descripcion: '',
                    items: '',
                    precio: '',
                    imagen: '',
                    destacado: false
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
            <h2>{combo ? 'Editar Promoción' : 'Crear Nueva Promoción'}</h2>

            {message && (
                <div className={`${styles.message} ${message.includes('Error') ? styles.error : styles.success}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="id">ID *</label>
                    <input
                        id="id"
                        type="text"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        placeholder="Ej: c5"
                        maxLength="20"
                        disabled={!!combo}
                    />
                    {errors.id && <span className={styles.error}>{errors.id}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="nombre">Nombre *</label>
                    <input
                        id="nombre"
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Kit Uniforme Médico"
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
                        placeholder="Ej: 1 Chaqueta + 1 Pantalón"
                        maxLength="500"
                        rows="3"
                    />
                    <small>{formData.descripcion.length}/500</small>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="items">Items</label>
                    <textarea
                        id="items"
                        name="items"
                        value={formData.items}
                        onChange={handleChange}
                        placeholder="Ej: Chaqueta, Pantalón"
                        maxLength="500"
                        rows="2"
                    />
                    <small>{formData.items.length}/500</small>
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
                        <label htmlFor="imagen">URL de Imagen</label>
                        <input
                            id="imagen"
                            type="text"
                            name="imagen"
                            value={formData.imagen}
                            onChange={handleChange}
                            placeholder="/images/combo.jpg"
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>
                        <input
                            type="checkbox"
                            name="destacado"
                            checked={formData.destacado}
                            onChange={handleChange}
                        />
                        <span>Destacado</span>
                    </label>
                </div>

                <div className={styles.actions}>
                    <button type="submit" disabled={loading} className={`btn btn-primary ${styles.submitBtn}`}>
                        {loading ? 'Guardando...' : (combo ? 'Actualizar' : 'Crear')}
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
