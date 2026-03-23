import AdminComboList from './AdminComboList';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AdminCombosPage() {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token');

    if (!token) {
        redirect('/admin');
    }

    return (
        <div style={{ paddingTop: '40px' }}>
            <AdminComboList />
        </div>
    );
}
