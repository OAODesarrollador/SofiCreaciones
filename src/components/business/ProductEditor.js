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
    const [uploading, setUploading] = useState(false);
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

    // Subir imagen a Vercel Blob
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const uploadData = new FormData();
            uploadData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error al subir imagen');
            }
            
            const data = await response.json();
            
            // Actualizar la URL de la imagen en el formulario para que se previsualice
            setFormData(prev => ({ ...prev, imagen: data.url }));
            setMessage('📸 Imagen subida y optimizada exitosamente');
        } catch (error) {
            setMessage(`❌ Error subiendo imagen: ${error.message}`);
        } finally {
            setUploading(false);
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
                        <input
                            id="categoria"
                            type="text"
                            name="categoria"
                            list="categorias_lista"
                            value={formData.categoria}
                            onChange={handleChange}
                            placeholder="Ej: DISFRACES, OTRA NUEVA..."
                            autoComplete="off"
                        />
                        <datalist id="categorias_lista">
                            {categories.map((c) => (
                                <option value={c} key={c} />
                            ))}
                        </datalist>
                        {errors.categoria && <span className={styles.error}>{errors.categoria}</span>}
                        <small style={{ color: '#666', marginTop: '4px', display: 'block', fontSize: '0.8rem' }}>Elige una sugerencia o escribe una nueva para crearla automáticamente.</small>
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
                </div>

                {/* --- NUEVO BLOQUE DE IMAGEN CON MINIATURA --- */}
                <div className={styles.formGroup}>
                    <label>Fotografía del Producto</label>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', background: '#f5f5f5', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                        {/* Miniatura */}
                        <div style={{ width: '150px', height: '150px', backgroundColor: '#eaeaea', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            {formData.imagen ? (
                                <img src={formData.imagen} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '3rem', color: '#ccc' }}>📷</span>
                            )}
                        </div>

                        {/* Controles de Subida */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 'bold' }}>Subir foto desde este dispositivo:</p>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                    disabled={uploading}
                                    style={{ width: '100%', padding: '10px', background: 'white', border: '1px dashed #aaa', borderRadius: '4px', cursor: 'pointer' }}
                                />
                                {uploading && <small style={{ color: '#0066cc', fontWeight: '600', display: 'block', marginTop: '5px' }}>⏳ Subiendo a la nube de Vercel...</small>}
                            </div>
                            
                            <div>
                                <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666' }}>O ingresar enlace (URL) directamente:</p>
                                <input
                                    id="imagen"
                                    type="text"
                                    name="imagen"
                                    value={formData.imagen}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    style={{ width: '100%' }}
                                    disabled={uploading}
                                />
                            </div>
                        </div>
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
                        <span style={{ marginLeft: '8px' }}>Disponible en inventario</span>
                    </label>
                </div>

                <div className={styles.actions}>
                    <button type="submit" disabled={loading} className={`btn btn-primary ${styles.submitBtn}`}>
                        {loading ? 'Guardando...' : (product ? 'Actualizar Producto' : 'Crear Producto')}
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
