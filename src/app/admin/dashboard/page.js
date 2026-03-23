import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import styles from './DashboardMenu.module.css';

export const revalidate = 0;

const options = [
    {
        href: '/admin/orders',
        title: 'Pedidos',
        description: 'Visualizar pedidos del día actual y del día anterior.',
        icon: '🛒🛵'
    },
    {
        href: '/admin/statistics',
        title: 'Estadísticas',
        description: 'Ver métricas rápidas de productos, combos y categorías.',
        icon: '📊'
    },
    {
        href: '/admin/products',
        title: 'Productos',
        description: 'Crear, editar, eliminar y actualizar disponibilidad de productos.',
        icon: '📦'
    },
    {
        href: '/admin/combos',
        title: 'Promociones / Kits',
        description: 'Gestionar promociones, kits armados, precios y destacados.',
        icon: '🎁'
    },
    {
        href: '/admin/categories',
        title: 'Categorías',
        description: 'Renombrar y depurar categorías para mantener ordenado el catálogo.',
        icon: '🗂️'
    },
    
    
];

export default async function AdminDashboard() {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token');

    if (!token) {
        redirect('/admin');
    }

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Panel de Mantenimiento</h1>
                    <p>Selecciona el módulo que quieres administrar</p>
                </div>
                <Link href="/admin" className={styles.exitLink}>
                    🚪 Salir del sistema
                </Link>
            </header>

            <section className={styles.grid}>
                {options.map((option) => (
                    <Link key={option.href} href={option.href} className={styles.card}>
                        <span className={styles.icon}>{option.icon}</span>
                        <h2>{option.title}</h2>
                        <p>{option.description}</p>
                    </Link>
                ))}
            </section>
        </main>
    );
}
