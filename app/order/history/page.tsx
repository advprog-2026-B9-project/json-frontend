"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./history.module.css";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Order {
    id: string;
    productName?: string;
    productId: string;
    quantity: number;
    totalPrice: number;
    shippingAddress: string;
    status: string;
    trackingNumber?: string;
    jastiperRating?: number;
    productRating?: number;
    createdAt?: string;
}

interface User {
    id: string;
    fullName: string;
    username: string;
    email: string;
    role: string;
}

// ─── Star Picker ──────────────────────────────────────────────────────────────

function StarPicker({
                        label,
                        value,
                        onChange,
                    }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
}) {
    const [hovered, setHovered] = useState(0);
    const hints = ["", "Sangat Kurang", "Kurang", "Cukup", "Bagus", "Luar Biasa!"];
    const active = hovered || value;

    return (
        <div className={styles.starGroup}>
            <p className={styles.starLabel}>{label}</p>
            <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`${styles.star} ${star <= active ? styles.starFilled : ""}`}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => onChange(star)}
                        aria-label={`${star} bintang`}
                    >
                        ★
                    </button>
                ))}
            </div>
            <p className={styles.starHint}>{active ? hints[active] : "Pilih rating"}</p>
        </div>
    );
}

// ─── Rating Modal ─────────────────────────────────────────────────────────────

function RatingModal({
                         orderId,
                         onClose,
                         onSuccess,
                     }: {
    orderId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [jastiperRating, setJastiperRating] = useState(0);
    const [productRating, setProductRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    const handleSubmit = async () => {
        if (!jastiperRating || !productRating) {
            setError("Mohon isi semua rating sebelum mengirim.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `${API}/api/orders/${orderId}/rate?jastiperRating=${jastiperRating}&productRating=${productRating}`,
                { method: "POST" }
            );
            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const msg = await res.text();
                setError(msg || "Gagal mengirim rating.");
            }
        } catch {
            setError("Tidak dapat terhubung ke server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <p className={styles.modalEmoji}>⭐</p>
                    <h2 className={styles.modalTitle}>Beri Penilaian</h2>
                    <p className={styles.modalSubtitle}>Bantu komunitas dengan berbagi pengalamanmu!</p>
                </div>
                <StarPicker label="Pelayanan Jastiper" value={jastiperRating} onChange={setJastiperRating} />
                <StarPicker label="Kualitas Produk" value={productRating} onChange={setProductRating} />
                {error && <p className={styles.modalError}>{error}</p>}
                <div className={styles.modalActions}>
                    <button className={styles.btnSecondary} onClick={onClose} disabled={loading}>
                        Batal
                    </button>
                    <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
                        {loading ? "Mengirim..." : "Kirim Penilaian"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Status Tabs ──────────────────────────────────────────────────────────────

const STATUS_TABS = ["SEMUA", "PAID", "PURCHASED", "SHIPPED", "COMPLETED", "CANCELLED"];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrderHistoryPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("SEMUA");
    const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    // ── Auth: ambil user dari localStorage ──
    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) {
            router.push("/login");
            return;
        }
        setUser(JSON.parse(stored));
    }, [router]);

    // ── Fetch orders setelah user tersedia ──
    useEffect(() => {
        if (user?.id) fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchOrders = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/orders/history/${user.id}`);
            if (res.ok) {
                const data: Order[] = await res.json();
                // Sort terbaru dulu
                data.sort((a, b) =>
                    new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
                );
                setOrders(data);
            } else {
                showToast("Gagal memuat pesanan.", "error");
            }
        } catch {
            showToast("Tidak dapat terhubung ke server.", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg: string, type: "success" | "error") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Batalkan pesanan ──
    const handleCancel = async (orderId: string) => {
        if (!confirm("Yakin ingin membatalkan? Saldo akan di-refund otomatis.")) return;
        try {
            const res = await fetch(`${API}/api/orders/${orderId}/cancel`, { method: "PATCH" });
            if (res.ok) {
                showToast("Pesanan dibatalkan. Saldo sudah di-refund!", "success");
                fetchOrders();
            } else {
                const msg = await res.text();
                showToast(msg || "Gagal membatalkan pesanan.", "error");
            }
        } catch {
            showToast("Tidak dapat terhubung ke server.", "error");
        }
    };

    // ── Konfirmasi terima barang (SHIPPED → COMPLETED) ──
    const handleConfirmReceived = async (orderId: string) => {
        if (!confirm("Konfirmasi bahwa barang sudah kamu terima?")) return;
        try {
            const res = await fetch(`${API}/api/orders/${orderId}/completed`, { method: "PATCH" });
            if (res.ok) {
                showToast("Pesanan selesai! Jangan lupa beri penilaian ya 😊", "success");
                fetchOrders();
            } else {
                const msg = await res.text();
                showToast(msg || "Gagal mengkonfirmasi penerimaan.", "error");
            }
        } catch {
            showToast("Tidak dapat terhubung ke server.", "error");
        }
    };

    // ── Filter by tab ──
    const filtered =
        activeTab === "SEMUA" ? orders : orders.filter((o) => o.status === activeTab);

    const formatDate = (iso?: string) => {
        if (!iso) return "-";
        return new Date(iso).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <div className={styles.loadingWrapper}>
                <div className={styles.spinner} />
                <p>Memuat pesanan...</p>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* Toast */}
            {toast && (
                <div
                    className={`${styles.toast} ${
                        toast.type === "success" ? styles.toastSuccess : styles.toastError
                    }`}
                >
                    {toast.type === "success" ? "✓" : "✕"} {toast.msg}
                </div>
            )}

            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button className={styles.backBtn} onClick={() => router.push("/products")}>
                        ← Kembali
                    </button>
                    <div>
                        <h1 className={styles.title}>Riwayat Pesanan</h1>
                        <p className={styles.subtitle}>
                            Halo, <strong>{user?.fullName || user?.username}</strong> — {orders.length} pesanan
                        </p>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className={styles.tabs}>
                    {STATUS_TABS.map((tab) => {
                        const count =
                            tab === "SEMUA"
                                ? orders.length
                                : orders.filter((o) => o.status === tab).length;
                        return (
                            <button
                                key={tab}
                                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                                {count > 0 && <span className={styles.tabBadge}>{count}</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Order List */}
                {filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyEmoji}>🛍️</p>
                        <p className={styles.emptyTitle}>Belum ada pesanan</p>
                        <p className={styles.emptyDesc}>
                            {activeTab === "SEMUA"
                                ? "Yuk hunting barang jastip pertamamu!"
                                : `Tidak ada pesanan dengan status ${activeTab}.`}
                        </p>
                    </div>
                ) : (
                    filtered.map((order) => (
                        <div key={order.id} className={styles.card}>
                            {/* Header */}
                            <div className={styles.cardHeader}>
                <span className={styles.orderId}>
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                                <div className={styles.cardHeaderRight}>
                                    <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                                    <span className={`${styles.badge} ${styles[`badge${order.status}` as keyof typeof styles]}`}>
                    {order.status}
                  </span>
                                </div>
                            </div>

                            {/* Detail */}
                            <div className={styles.details}>
                                <p className={styles.productName}>
                                    {order.productName || order.productId}
                                </p>
                                <div className={styles.detailGrid}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Total Harga</span>
                                        <span className={styles.detailValue}>
                      Rp {order.totalPrice.toLocaleString("id-ID")}
                    </span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Jumlah</span>
                                        <span className={styles.detailValue}>{order.quantity} pcs</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Alamat</span>
                                        <span className={styles.detailValue}>{order.shippingAddress}</span>
                                    </div>
                                    {order.trackingNumber && (
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Nomor Resi</span>
                                            <span className={`${styles.detailValue} ${styles.resi}`}>
                        📦 {order.trackingNumber}
                      </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className={styles.actionGroup}>
                                {order.status === "PAID" && (
                                    <button
                                        className={styles.btnCancel}
                                        onClick={() => handleCancel(order.id)}
                                    >
                                        Batalkan Pesanan
                                    </button>
                                )}

                                {order.status === "SHIPPED" && (
                                    <button
                                        className={styles.btnConfirm}
                                        onClick={() => handleConfirmReceived(order.id)}
                                    >
                                        ✓ Konfirmasi Terima
                                    </button>
                                )}

                                {order.status === "COMPLETED" && !order.jastiperRating && (
                                    <button
                                        className={styles.btnRate}
                                        onClick={() => setRatingOrderId(order.id)}
                                    >
                                        ⭐ Beri Penilaian
                                    </button>
                                )}

                                {order.status === "COMPLETED" && order.jastiperRating && (
                                    <div className={styles.ratingDisplay}>
                    <span>
                      🧳 Jastiper:{" "}
                        {"★".repeat(order.jastiperRating)}
                        {"☆".repeat(5 - order.jastiperRating)}
                    </span>
                                        <span>
                      📦 Produk:{" "}
                                            {"★".repeat(order.productRating ?? 0)}
                                            {"☆".repeat(5 - (order.productRating ?? 0))}
                    </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Rating Modal */}
            {ratingOrderId && (
                <RatingModal
                    orderId={ratingOrderId}
                    onClose={() => setRatingOrderId(null)}
                    onSuccess={() => {
                        showToast("Terima kasih atas penilaianmu! 🎉", "success");
                        fetchOrders();
                    }}
                />
            )}
        </div>
    );
}