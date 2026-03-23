import AdminProductList from '../dashboard/AdminProductList';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AdminProductsPage() {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token');

    if (!token) {
        redirect('/admin');
    }

    return (
        <div style={{ paddingTop: '40px' }}>
            <AdminProductList />
        </div>
    );
}
