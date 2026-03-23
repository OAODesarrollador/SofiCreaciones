'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import styles from './statistics.module.css';

const PAYMENT_COLORS = ['#22c55e', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

const formatPaymentMethod = (method) => {
    const map = {
        efectivo: 'Efectivo',
        transferencia: 'Transferencia',
        mercadopago: 'Tarjeta (MP)',
        mercadopago_app: 'Mercado Pago App',
        desconocido: 'Desconocido'
    };
    return map[method] || method;
};

export default function StatisticsClient() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [salesPeriod, setSalesPeriod] = useState('month');
    const [stats, setStats] = useState({
        products: 0,
        availableProducts: 0,
        unavailableProducts: 0,
        availabilityRate: 0,
        combos: 0,
        featuredCombos: 0,
        categories: 0,
        topCategories: []
    });
    const [salesStats, setSalesStats] = useState({
        period: 'month',
        topProducts: [],
        otherProducts: { quantity: 0, percentage: 0 },
        totals: { unitsSold: 0, orders: 0, revenue: 0 },
        salesSeries: [],
        paymentMethods: []
    });
    const router = useRouter();

    const loadStats = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const [productsRes, combosRes, categoriesRes, salesRes] = await Promise.all([
                fetch('/api/admin/products'),
                fetch('/api/admin/combos'),
                fetch('/api/admin/categories'),
                fetch(`/api/admin/statistics/sales?period=${salesPeriod}`)
            ]);

            if (!productsRes.ok || !combosRes.ok || !categoriesRes.ok || !salesRes.ok) {
                throw new Error('No se pudieron obtener las estadísticas');
            }

            const [productsData, combosData, categoriesData, salesData] = await Promise.all([
                productsRes.json(),
                combosRes.json(),
                categoriesRes.json(),
                salesRes.json()
            ]);

            const products = productsData.data || [];
            const combos = combosData.data || [];
            const categories = categoriesData.data || [];
            const availableProducts = products.filter((p) => p.disponible).length;
            const unavailableProducts = products.length - availableProducts;
            const availabilityRate = products.length > 0
                ? Math.round((availableProducts / products.length) * 100)
                : 0;
            const featuredCombos = combos.filter((c) => c.destacado).length;

            const categoryCount = products.reduce((acc, product) => {
                const key = product.categoria || 'Sin categoría';
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});

            const topCategories = Object.entries(categoryCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);

            setStats({
                products: products.length,
                availableProducts,
                unavailableProducts,
                availabilityRate,
                combos: combos.length,
                featuredCombos,
                categories: categories.length,
                topCategories
            });

            setSalesStats(salesData.data || {
                period: salesPeriod,
                topProducts: [],
                otherProducts: { quantity: 0, percentage: 0 },
                totals: { unitsSold: 0, orders: 0, revenue: 0 },
                salesSeries: [],
                paymentMethods: []
            });
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message || 'Error al cargar estadísticas');
        } finally {
            setLoading(false);
        }
    }, [salesPeriod]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const topProducts = useMemo(() => salesStats.topProducts || [], [salesStats.topProducts]);
    const topProductsMaxQty = useMemo(() => Math.max(...topProducts.map((item) => item.quantity), 1), [topProducts]);

    const paymentPieData = useMemo(() => (salesStats.paymentMethods || []).map((item) => ({
        ...item,
        label: formatPaymentMethod(item.method)
    })), [salesStats.paymentMethods]);

    const paymentPieBackground = useMemo(() => {
        if (!paymentPieData.length) return 'conic-gradient(#374151 0 100%)';
        let current = 0;
        const chunks = paymentPieData.map((item, idx) => {
            const start = current;
            current += item.percentage;
            const end = idx === paymentPieData.length - 1 ? 100 : current;
            return `${PAYMENT_COLORS[idx % PAYMENT_COLORS.length]} ${start}% ${end}%`;
        });
        return `conic-gradient(${chunks.join(', ')})`;
    }, [paymentPieData]);

    const lineChart = useMemo(() => {
        const data = salesStats.salesSeries || [];
        if (!data.length) return { points: '', markers: [], labels: [] };

        const width = 700;
        const height = 240;
        const paddingX = 24;
        const paddingTop = 16;
        const paddingBottom = 28;
        const maxValue = Math.max(...data.map((d) => d.value), 1);
        const innerWidth = width - paddingX * 2;
        const innerHeight = height - paddingTop - paddingBottom;

        const markers = data.map((item, index) => {
            const x = paddingX + (index * innerWidth) / Math.max(data.length - 1, 1);
            const y = paddingTop + innerHeight - (item.value / maxValue) * innerHeight;
            return { ...item, x, y };
        });

        const points = markers.map((m) => `${m.x},${m.y}`).join(' ');
        const labelStep = data.length > 16 ? 3 : data.length > 10 ? 2 : 1;
        const labels = markers.filter((_, idx) => idx % labelStep === 0 || idx === markers.length - 1);

        return { points, markers, labels, width, height, baseline: height - paddingBottom };
    }, [salesStats.salesSeries]);

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>📊 Estadísticas</h1>
                    <p>Resumen rápido del estado del catálogo</p>
                </div>
                <div className={styles.headerActions}>
                    <button onClick={loadStats} className={`btn btn-primary ${styles.refreshBtn}`} disabled={loading}>
                        ⟳ Actualizar
                    </button>
                    <button onClick={() => router.push('/admin/dashboard')} className={`btn btn-secondary ${styles.backBtn}`}>
                        ← Volver
                    </button>
                </div>
            </div>

            {loading ? <div className={styles.loading}>Cargando estadísticas...</div> : null}
            {error ? <div className={styles.error}>{error}</div> : null}

            {!loading && !error ? (
                <>
                    <section className={styles.grid}>
                        <article className={styles.statCard}>
                            <span className={styles.label}>Productos Totales</span>
                            <strong>{stats.products}</strong>
                        </article>
                        <article className={styles.statCard}>
                            <span className={styles.label}>Productos Disponibles</span>
                            <strong>{stats.availableProducts}</strong>
                        </article>
                        <article className={styles.statCard}>
                            <span className={styles.label}>Productos No Disponibles</span>
                            <strong>{stats.unavailableProducts}</strong>
                        </article>
                        <article className={styles.statCard}>
                            <span className={styles.label}>Disponibilidad del Catálogo</span>
                            <strong>{stats.availabilityRate}%</strong>
                        </article>
                        <article className={styles.statCard}>
                            <span className={styles.label}>Combos Totales</span>
                            <strong>{stats.combos}</strong>
                        </article>
                        <article className={styles.statCard}>
                            <span className={styles.label}>Combos Destacados</span>
                            <strong>{stats.featuredCombos}</strong>
                        </article>
                        <article className={styles.statCard}>
                            <span className={styles.label}>Categorías Totales</span>
                            <strong>{stats.categories}</strong>
                        </article>
                    </section>

                    <section className={styles.chartsHeader}>
                        <h2>Análisis de ventas</h2>
                        <div className={styles.periodSelector}>
                            <label htmlFor="period">Período</label>
                            <select
                                id="period"
                                value={salesPeriod}
                                onChange={(e) => setSalesPeriod(e.target.value)}
                                className={styles.periodSelect}
                            >
                                <option value="week">Semana actual</option>
                                <option value="month">Mes actual</option>
                                <option value="quarter">Trimestre actual</option>
                                <option value="year">Año actual</option>
                            </select>
                        </div>
                    </section>

                    <section className={styles.chartsGrid}>
                        <article className={styles.chartCard}>
                            <h3>Top 5 productos más vendidos</h3>
                            <div className={styles.barChart}>
                                {topProducts.length > 0 ? topProducts.map((item) => (
                                    <div key={item.name} className={styles.barRow}>
                                        <div className={styles.barLabelRow}>
                                            <em>{item.name}</em>
                                            <strong>{item.quantity} u. ({item.percentage}%)</strong>
                                        </div>
                                        <div className={styles.barTrack}>
                                            <div
                                                className={styles.barFill}
                                                style={{ width: `${(item.quantity / topProductsMaxQty) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )) : <p>Sin ventas para este período.</p>}
                            </div>
                        </article>

                        <article className={styles.chartCard}>
                            <h3>Ventas por método de pago (%)</h3>
                            <div className={styles.pieWrap}>
                                <div className={styles.pieChart} style={{ background: paymentPieBackground }} />
                                <ul className={styles.legend}>
                                    {paymentPieData.length > 0 ? paymentPieData.map((item, idx) => (
                                        <li key={item.method}>
                                            <span style={{ backgroundColor: PAYMENT_COLORS[idx % PAYMENT_COLORS.length] }} />
                                            <em>{item.label}</em>
                                            <strong>{item.percentage}%</strong>
                                        </li>
                                    )) : <li>Sin ventas para este período.</li>}
                                </ul>
                            </div>
                        </article>

                        <article className={styles.chartCard}>
                            <h3>Ventas por período</h3>
                            <div className={styles.lineChartWrap}>
                                <svg viewBox={`0 0 ${lineChart.width || 700} ${lineChart.height || 240}`} className={styles.lineChart}>
                                    <line
                                        x1="24"
                                        y1={lineChart.baseline || 212}
                                        x2={(lineChart.width || 700) - 24}
                                        y2={lineChart.baseline || 212}
                                        stroke="rgba(255,255,255,0.25)"
                                    />
                                    {lineChart.points ? (
                                        <polyline
                                            fill="none"
                                            stroke="#22d3ee"
                                            strokeWidth="3"
                                            points={lineChart.points}
                                        />
                                    ) : null}
                                    {lineChart.markers?.map((marker, idx) => (
                                        <circle
                                            key={`${marker.label}-${idx}`}
                                            cx={marker.x}
                                            cy={marker.y}
                                            r="3.5"
                                            fill="#f97316"
                                        />
                                    ))}
                                </svg>
                                <div className={styles.lineLabels}>
                                    {lineChart.labels?.map((label, idx) => (
                                        <span key={`${label.label}-${idx}`}>{label.label}</span>
                                    ))}
                                </div>
                            </div>
                        </article>
                    </section>

                    <section className={styles.salesSummary}>
                        <article>
                            <span>Total vendido (monto)</span>
                            <strong>{formatPrice(salesStats.totals?.revenue || 0)}</strong>
                        </article>
                        <article>
                            <span>Pedidos en el período</span>
                            <strong>{salesStats.totals?.orders || 0}</strong>
                        </article>
                        <article>
                            <span>Unidades vendidas</span>
                            <strong>{salesStats.totals?.unitsSold || 0}</strong>
                        </article>
                    </section>

                    <section className={styles.detailPanel}>
                        <h2>Top categorías por cantidad de productos</h2>
                        {stats.topCategories.length > 0 ? (
                            <ul className={styles.topList}>
                                {stats.topCategories.map(([category, qty]) => (
                                    <li key={category}>
                                        <span>{category}</span>
                                        <strong>{qty}</strong>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No hay datos de categorías para mostrar.</p>
                        )}
                    </section>

                    <p className={styles.updatedAt}>
                        Última actualización: {lastUpdated ? lastUpdated.toLocaleString('es-AR') : '-'}
                    </p>
                </>
            ) : null}
        </main>
    );
}
