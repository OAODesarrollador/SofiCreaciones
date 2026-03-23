import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import StatisticsClient from './StatisticsClient';

export const revalidate = 0;

export default async function AdminStatisticsPage() {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token');

    if (!token) {
        redirect('/admin');
    }

    return <StatisticsClient />;
}
