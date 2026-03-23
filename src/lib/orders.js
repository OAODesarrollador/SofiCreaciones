import { db } from './db';
import { orders, orderItems } from './db/schema';

export async function saveOrderToSheet(orderData) { // Keeping name for compatibility, but it saves to DB
    try {
        const {
            id,
            date,
            customer,
            delivery,
            payment,
            items,
            total,
            status,
            comments
        } = orderData;

        // Transaction to save Order + Items
        await db.transaction(async (tx) => {
            await tx.insert(orders).values({
                id,
                date,
                customerName: customer.name,
                customerPhone: customer.phone,
                deliveryMethod: delivery.method,
                deliveryAddress: delivery.address,
                paymentMethod: payment.method,
                total,
                status,
                comments,
                itemsDisplay: items.map(i => `${i.quantity}x ${i.nombre}`).join(', ')
            });

            if (items && items.length > 0) {
                await tx.insert(orderItems).values(
                    items.map(item => ({
                        orderId: id,
                        productName: item.nombre,
                        quantity: item.quantity,
                        price: item.precio
                    }))
                );
            }
        });

        return { success: true };

    } catch (error) {
        console.error("Error saving order to DB:", error);
        return { success: false, error: error.message };
    }
}
