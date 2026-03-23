export function generateWhatsAppMessage(order) {
    const { id, customer, delivery, payment, items, total, comments } = order;

    let text = `*NUEVA COMPRA #${id}*\n\n`;
    text += `👤 *Cliente:* ${customer.name}\n`;
    text += `📞 *Teléfono:* ${customer.phone}\n`;

    if (delivery.method === 'envio') {
        text += `🛵 *Tipo:* Envío a domicilio\n`;
        text += `📍 *Dirección:* ${delivery.address}\n`;
    } else {
        text += `🏃 *Tipo:* Retiro en tienda\n`;
    }

    text += `💰 *Pago:* ${payment.method}\n\n`;

    text += `*DETALLE DE LA COMPRA:*\n`;
    items.forEach(item => {
        text += `- ${item.quantity}x ${item.nombre} ($${item.precio * item.quantity})\n`;
    });

    text += `\n*TOTAL: $${total}*\n`;

    if (comments) {
        text += `\n📝 *Observaciones:* ${comments}\n`;
    }

    return text;
}

export function openWhatsApp(phone, message) {
    // Check if phone has valid format (remove +, spaces, dashes)
    const cleanPhone = phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}
