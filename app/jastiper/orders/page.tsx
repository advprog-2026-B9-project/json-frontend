"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../products/jastiper.module.css';

interface Order {
    id: string; productName?: string; productId: string; quantity: number;
    totalPrice: number; shippingAddress: string; status: string;
    trackingNumber?: string; titiperId: string; createdAt?: string;
}
interface User { id: string; fullName: string; username: string; role: string; }

const TAB_CONFIG = [
    { key: 'PAID', label: 'Perlu Diproses', emoji: '🆕' },
    { key: 'PURCHASED', label: 'Sudah Dibelikan', emoji: '🛒' },
    { key: 'SHIPPED', label: 'Dikirim', emoji: '📦' },
    { key: 'COMPLETED', label: 'Selesai', emoji: '✅' },
    { key: 'CANCELLED', label: 'Dibatalkan', emoji: '❌' },
];
const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
    PAID: { bg: '#dbeafe', color: '#1d4ed8' }, PURCHASED: { bg: '#e0e7ff', color: '#4338ca' },
    SHIPPED: { bg: '#f3e8ff', color: '#7e22ce' }, COMPLETED: { bg: '#d1fae5', color: '#047857' },
    CANCELLED: { bg: '#fee2e2', color: '#b91c1c' },
};

function ShippedModal({ orderId, onClose, onSuccess }: { orderId: string; onClose: () => void; onSuccess: () => void }) {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const handleSubmit = async () => {
        if (!trackingNumber.trim()) { setError('Nomor resi wajib diisi.'); return; }
        setLoading(true); setError('');
        try {
            const res = await fetch(
                `${API}/api/v1/orders/${orderId}/shipped?trackingNumber=${encodeURIComponent(trackingNumber.trim())}`,
                { method: 'PATCH' }
            );
            if (res.ok) { onSuccess(); onClose(); }
            else { const msg = await res.text(); setError(msg || 'Gagal update status.'); }
        } catch { setError('Tidak dapat terhubung ke server.'); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }} onClick={onClose}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700, color: '#1f2937' }}>📦 Input Nomor Resi</h2>
                <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>Masukkan nomor resi pengiriman untuk pesanan ini.</p>
                <input type="text" placeholder="Contoh: JNE-1234567890" value={trackingNumber}
                       onChange={e => setTrackingNumber(e.target.value)} className={styles.inputField}
                       style={{ width: '100%', marginBottom: '0.75rem', boxSizing: 'border-box' }}
                       onKeyDown={e => e.key === 'Enter' && handleSubmit()} autoFocus />
                {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '0 0 1rem' }}>{error}</p>}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className={styles.secondaryBtn} onClick={onClose} disabled={loading} style={{ flex: 1 }}>Batal</button>
                    <button className={styles.primaryBtn} onClick={handleSubmit} disabled={loading} style={{ flex: 1 }}>
                        {loading ? 'Menyimpan...' : 'Konfirmasi Kirim'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function JastiperOrdersPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('PAID');
    const [shippedOrderId, setShippedOrderId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/login'); return; }
        const parsed: User = JSON.parse(stored);
        if (parsed.role !== 'JASTIPER') { router.push('/'); return; }
        setUser(parsed);
    }, [router]);

    useEffect(() => {
        if (user?.id) fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchOrders = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/v1/orders/jastiper/${user.id}`);
            if (res.ok) {
                const data: Order[] = await res.json();
                data.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
                setOrders(data);
            } else { showToast('Gagal memuat pesanan.', 'error'); }
        } catch { showToast('Tidak dapat terhubung ke server.', 'error'); }
        finally { setLoading(false); }
    };

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handlePurchased = async (orderId: string) => {
        if (!confirm('Konfirmasi bahwa barang sudah kamu belikan?')) return;
        try {
            const res = await fetch(`${API}/api/v1/orders/${orderId}/purchased`, { method: 'PATCH' });
            if (res.ok) { showToast('Status diperbarui ke Sudah Dibelikan!', 'success'); fetchOrders(); }
            else { const msg = await res.text(); showToast(msg || 'Gagal update status.', 'error'); }
        } catch { showToast('Tidak dapat terhubung ke server.', 'error'); }
    };

    const handleCancel = async (orderId: string) => {
        if (!confirm('Yakin ingin membatalkan pesanan ini? Saldo Titipers akan di-refund otomatis.')) return;
        try {
            const res = await fetch(`${API}/api/v1/orders/${orderId}/cancel`, { method: 'PATCH' });
            if (res.ok) { showToast('Pesanan dibatalkan. Refund otomatis dikirim ke Titipers.', 'success'); fetchOrders(); }
            else { const msg = await res.text(); showToast(msg || 'Gagal membatalkan pesanan.', 'error'); }
        } catch { showToast('Tidak dapat terhubung ke server.', 'error'); }
    };

    const filtered = orders.filter(o => o.status === activeTab);
    const formatDate = (iso?: string) => {
        if (!iso) return '-';
        return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (!user) return null;

    return (
        <div className={styles.pageContainer}>
            {toast && (
                <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', padding: '12px 24px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, color: 'white', zIndex: 999, whiteSpace: 'nowrap', background: toast.type === 'success' ? '#10b981' : '#ef4444' }}>
                    {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
                </div>
            )}
            <div className={styles.banner} />
            <div className={styles.card}>
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.headerTitle}>Kelola Pesanan</h1>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
                            Halo, <strong>{user.fullName || user.username}</strong> — {orders.length} total pesanan masuk
                        </p>
                    </div>
                    <button className={styles.secondaryBtn} onClick={() => router.push('/jastiper')}>← Kembali</button>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', borderBottom: '1px solid #e5e7eb' }}>
                    {TAB_CONFIG.map(({ key, label, emoji }) => {
                        const count = orders.filter(o => o.status === key).length;
                        const isActive = activeTab === key;
                        return (
                            <button key={key} onClick={() => setActiveTab(key)} style={{ padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: isActive ? 700 : 500, color: isActive ? '#8F39DF' : '#64748b', borderBottom: isActive ? '3px solid #8F39DF' : '3px solid transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
                                {emoji} {label}
                                {count > 0 && <span style={{ background: isActive ? '#8F39DF' : '#e5e7eb', color: isActive ? 'white' : '#374151', borderRadius: '999px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 }}>{count}</span>}
                            </button>
                        );
                    })}
                </div>
                {loading ? <p className={styles.centerMessage}>Memuat pesanan...</p>
                    : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
                            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
                            <p style={{ fontWeight: 600, color: '#64748b' }}>Tidak ada pesanan {TAB_CONFIG.find(t => t.key === activeTab)?.label}</p>
                        </div>
                    ) : (
                        <div className={styles.listContainer}>
                            {filtered.map(order => {
                                const badge = STATUS_BADGE[order.status] || { bg: '#f3f4f6', color: '#374151' };
                                return (
                                    <div key={order.id} className={styles.productRow} style={{ flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8', background: '#f8fafc', padding: '2px 8px', borderRadius: '4px' }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{formatDate(order.createdAt)}</span>
                                                <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: badge.bg, color: badge.color }}>{order.status}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className={styles.productName} style={{ margin: '0 0 8px' }}>{order.productName || order.productId}</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 16px' }}>
                                                <div><span className={styles.metaLabel}>Total Harga</span><span className={styles.productMeta}>Rp {order.totalPrice.toLocaleString('id-ID')}</span></div>
                                                <div><span className={styles.metaLabel}>Jumlah</span><span className={styles.productMeta}>{order.quantity} pcs</span></div>
                                                <div><span className={styles.metaLabel}>Alamat Pengiriman</span><span className={styles.productMeta}>{order.shippingAddress || '-'}</span></div>
                                                {order.trackingNumber && <div><span className={styles.metaLabel}>Nomor Resi</span><span className={styles.productMeta} style={{ color: '#7e22ce', fontFamily: 'monospace' }}>{order.trackingNumber}</span></div>}
                                            </div>
                                        </div>
                                        <div className={styles.actionGroup}>
                                            {order.status === 'PAID' && (<><button className={styles.primaryBtn} onClick={() => handlePurchased(order.id)}>🛒 Sudah Dibelikan</button><button className={styles.dangerBtn} onClick={() => handleCancel(order.id)}>Batalkan</button></>)}
                                            {order.status === 'PURCHASED' && (<><button className={styles.primaryBtn} onClick={() => setShippedOrderId(order.id)}>📦 Input Resi & Kirim</button><button className={styles.dangerBtn} onClick={() => handleCancel(order.id)}>Batalkan</button></>)}
                                            {order.status === 'SHIPPED' && <span style={{ fontSize: '0.875rem', color: '#7e22ce', fontWeight: 600 }}>📬 Menunggu konfirmasi Titipers</span>}
                                            {order.status === 'COMPLETED' && <span style={{ fontSize: '0.875rem', color: '#047857', fontWeight: 600 }}>🎉 Pesanan selesai</span>}
                                            {order.status === 'CANCELLED' && <span style={{ fontSize: '0.875rem', color: '#b91c1c', fontWeight: 600 }}>Pesanan dibatalkan</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
            </div>
            {shippedOrderId && (
                <ShippedModal orderId={shippedOrderId} onClose={() => setShippedOrderId(null)}
                              onSuccess={() => { showToast('Pesanan berhasil dikirim! Resi tersimpan.', 'success'); fetchOrders(); }} />
            )}
        </div>
    );
}