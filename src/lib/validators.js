/**
 * Validadores para datos de productos y pedidos
 */

export const productValidators = {
    /**
     * Valida los datos de un producto
     */
    validateProduct: (data) => {
        const errors = {};

        // Validar nombre
        if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim() === '') {
            errors.nombre = 'El nombre es requerido';
        } else if (data.nombre.length > 100) {
            errors.nombre = 'El nombre no puede exceder 100 caracteres';
        }

        // Validar descripción
        if (data.descripcion && typeof data.descripcion === 'string') {
            if (data.descripcion.length > 500) {
                errors.descripcion = 'La descripción no puede exceder 500 caracteres';
            }
        }

        // Validar precio
        if (!data.precio && data.precio !== 0) {
            errors.precio = 'El precio es requerido';
        } else if (isNaN(Number(data.precio)) || Number(data.precio) < 0) {
            errors.precio = 'El precio debe ser un número válido y no negativo';
        }

        // Validar categoría
        if (!data.categoria || typeof data.categoria !== 'string' || data.categoria.trim() === '') {
            errors.categoria = 'La categoría es requerida';
        }

        // Validar orden (opcional)
        if (data.orden !== undefined && (isNaN(Number(data.orden)) || Number(data.orden) < 0)) {
            errors.orden = 'El orden debe ser un número válido';
        }

        // Validar disponible (opcional)
        if (data.disponible !== undefined && typeof data.disponible !== 'boolean') {
            errors.disponible = 'El disponible debe ser verdadero o falso';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    /**
     * Valida actualización parcial de producto
     */
    validateProductUpdate: (data) => {
        const errors = {};

        if (data.nombre !== undefined) {
            if (typeof data.nombre !== 'string' || data.nombre.trim() === '') {
                errors.nombre = 'El nombre no puede estar vacío';
            } else if (data.nombre.length > 100) {
                errors.nombre = 'El nombre no puede exceder 100 caracteres';
            }
        }

        if (data.descripcion !== undefined) {
            if (data.descripcion && data.descripcion.length > 500) {
                errors.descripcion = 'La descripción no puede exceder 500 caracteres';
            }
        }

        if (data.precio !== undefined) {
            if (isNaN(Number(data.precio)) || Number(data.precio) < 0) {
                errors.precio = 'El precio debe ser un número válido y no negativo';
            }
        }

        if (data.categoria !== undefined) {
            if (typeof data.categoria !== 'string' || data.categoria.trim() === '') {
                errors.categoria = 'La categoría no puede estar vacía';
            }
        }

        if (data.orden !== undefined && (isNaN(Number(data.orden)) || Number(data.orden) < 0)) {
            errors.orden = 'El orden debe ser un número válido';
        }

        if (data.disponible !== undefined && typeof data.disponible !== 'boolean') {
            errors.disponible = 'El disponible debe ser verdadero o falso';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};
