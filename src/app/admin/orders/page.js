import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import OrdersClient from './OrdersClient';

export const revalidate = 0;

export default async function AdminOrdersPage() {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token');

    if (!token) {
        redirect('/admin');
    }

    return <OrdersClient />;
}

