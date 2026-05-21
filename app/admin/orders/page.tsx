"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Order {
    id: string;
    productName?: string;
    productId: string;
    quantity: number;
    totalPrice: number;
    shippingAddress: string;
    status: string;
    trackingNumber?: string;
    titiperId: string;
    jastiperId: string;
    createdAt?: string;
    jastiperRating?: number;
    productRating?: number;
}

interface User {
    id: string;
    fullName: string;
    username: string;
    role: string;
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string; emoji: string }> = {
    PAID:      { bg: "#dbeafe", color: "#1d4ed8", label: "Dibayar",        emoji: "💳" },
    PURCHASED: { bg: "#e0e7ff", color: "#4338ca", label: "Dibelikan",      emoji: "🛒" },
    SHIPPED:   { bg: "#f3e8ff", color: "#7e22ce", label: "Dikirim",         emoji: "📦" },
    COMPLETED: { bg: "#d1fae5", color: "#047857", label: "Selesai",         emoji: "✅" },
    CANCELLED: { bg: "#fee2e2", color: "#b91c1c", label: "Dibatalkan",      emoji: "❌" },
};

const ALL_STATUSES = ["ALL", "PAID", "PURCHASED", "SHIPPED", "COMPLETED", "CANCELLED"];

export default function AdminOrdersPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState("ALL");
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) { router.push("/login"); return; }
        const parsed: User = JSON.parse(stored);
        if (parsed.role !== "ADMIN") { router.push("/"); return; }
        setUser(parsed);
    }, [router]);

    useEffect(() => {
        if (user) fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/orders/admin/all`);
            if (res.ok) {
                const data: Order[] = await res.json();
                data.sort((a, b) =>
                    new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
                );
                setOrders(data);
            } else {
                showToast("Gagal memuat data order.", "error");
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

    const filtered = orders.filter((o) => {
        const matchStatus = activeStatus === "ALL" || o.status === activeStatus;
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            o.id.toLowerCase().includes(q) ||
            (o.productName ?? "").toLowerCase().includes(q) ||
            o.titiperId.toLowerCase().includes(q) ||
            o.jastiperId.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const formatDate = (iso?: string) => {
        if (!iso) return "-";
        return new Date(iso).toLocaleDateString("id-ID", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    const formatRupiah = (n: number) =>
        "Rp " + n.toLocaleString("id-ID");

    // Stats
    const stats = ALL_STATUSES.slice(1).map((s) => ({
        status: s,
        count: orders.filter((o) => o.status === s).length,
    }));
    const totalRevenue = orders
        .filter((o) => o.status === "COMPLETED")
        .reduce((sum, o) => sum + o.totalPrice, 0);

    if (!user) return null;

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', sans-serif" }}>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: "fixed", top: "24px", left: "50%", transform: "translateX(-50%)",
                    padding: "12px 24px", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 600,
                    color: "white", zIndex: 999, whiteSpace: "nowrap",
                    background: toast.type === "success" ? "#10b981" : "#ef4444",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}>
                    {toast.type === "success" ? "✓" : "✕"} {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%)",
                padding: "2rem 2rem 4rem",
                position: "relative", overflow: "hidden",
            }}>
                <div style={{
                    position: "absolute", inset: 0, opacity: 0.1,
                    backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }} />
                <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <p style={{ color: "#c4b5fd", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>
                                Admin Panel
                            </p>
                            <h1 style={{ color: "white", fontSize: "2rem", fontWeight: 800, margin: "0 0 6px" }}>
                                Monitor Transaksi
                            </h1>
                            <p style={{ color: "#a78bfa", margin: 0, fontSize: "0.9rem" }}>
                                {orders.length} total order • {formatRupiah(totalRevenue)} revenue selesai
                            </p>
                        </div>
                        <button
                            onClick={() => router.push("/admin")}
                            style={{
                                background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
                                color: "white", padding: "8px 16px", borderRadius: "8px",
                                cursor: "pointer", fontSize: "0.875rem", fontWeight: 600,
                                backdropFilter: "blur(8px)",
                            }}>
                            ← Kembali
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: "1200px", margin: "-2rem auto 0", padding: "0 2rem 3rem", position: "relative" }}>

                {/* Stats Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
                    {stats.map(({ status, count }) => {
                        const cfg = STATUS_CONFIG[status];
                        return (
                            <div
                                key={status}
                                onClick={() => setActiveStatus(status)}
                                style={{
                                    background: "white", borderRadius: "12px", padding: "16px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                    border: activeStatus === status ? `2px solid ${cfg.color}` : "2px solid transparent",
                                    cursor: "pointer", transition: "all 0.2s",
                                }}>
                                <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>{cfg.emoji}</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: cfg.color }}>{count}</div>
                                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>{cfg.label}</div>
                            </div>
                        );
                    })}
                    {/* Total card */}
                    <div
                        onClick={() => setActiveStatus("ALL")}
                        style={{
                            background: activeStatus === "ALL" ? "#4c1d95" : "white",
                            borderRadius: "12px", padding: "16px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            border: "2px solid transparent",
                            cursor: "pointer", transition: "all 0.2s",
                        }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>📊</div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 800, color: activeStatus === "ALL" ? "white" : "#4c1d95" }}>{orders.length}</div>
                        <div style={{ fontSize: "0.75rem", color: activeStatus === "ALL" ? "#c4b5fd" : "#64748b", fontWeight: 600 }}>Semua Order</div>
                    </div>
                </div>

                {/* Search + Filter Bar */}
                <div style={{
                    background: "white", borderRadius: "12px", padding: "16px 20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "20px",
                    display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap",
                }}>
                    <input
                        type="text"
                        placeholder="🔍  Cari ID order, nama produk, atau ID user..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            flex: 1, minWidth: "240px", padding: "10px 14px",
                            border: "1px solid #e5e7eb", borderRadius: "8px",
                            fontSize: "0.875rem", outline: "none", fontFamily: "inherit",
                        }}
                    />
                    <button
                        onClick={fetchOrders}
                        style={{
                            background: "#4c1d95", color: "white", border: "none",
                            padding: "10px 20px", borderRadius: "8px", cursor: "pointer",
                            fontSize: "0.875rem", fontWeight: 600, fontFamily: "inherit",
                        }}>
                        🔄 Refresh
                    </button>
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            Menampilkan {filtered.length} order
          </span>
                </div>

                {/* Orders Table */}
                <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                    {loading ? (
                        <div style={{ padding: "4rem", textAlign: "center", color: "#94a3b8" }}>
                            <p style={{ fontSize: "1.5rem" }}>⏳</p>
                            <p style={{ fontWeight: 600 }}>Memuat data...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: "4rem", textAlign: "center", color: "#94a3b8" }}>
                            <p style={{ fontSize: "2rem" }}>📭</p>
                            <p style={{ fontWeight: 600, color: "#64748b" }}>Tidak ada order ditemukan</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                                <thead>
                                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                                    {["Order ID", "Produk", "Titipers ID", "Jastiper ID", "Qty", "Total", "Status", "Tanggal", "Resi"].map((h) => (
                                        <th key={h} style={{
                                            padding: "12px 16px", textAlign: "left",
                                            fontSize: "0.75rem", fontWeight: 700,
                                            color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em",
                                            whiteSpace: "nowrap",
                                        }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {filtered.map((order, i) => {
                                    const cfg = STATUS_CONFIG[order.status] || { bg: "#f3f4f6", color: "#374151", label: order.status, emoji: "" };
                                    return (
                                        <tr
                                            key={order.id}
                                            style={{
                                                borderBottom: "1px solid #f1f5f9",
                                                background: i % 2 === 0 ? "white" : "#fafafa",
                                                transition: "background 0.15s",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ff")}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "white" : "#fafafa")}
                                        >
                                            <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                          <span style={{
                              fontFamily: "monospace", fontSize: "0.78rem",
                              color: "#7c3aed", background: "#f5f3ff",
                              padding: "2px 8px", borderRadius: "4px",
                          }}>
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                                            </td>
                                            <td style={{ padding: "12px 16px", maxWidth: "160px" }}>
                          <span style={{ fontWeight: 600, color: "#1f2937", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {order.productName || "-"}
                          </span>
                                                <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontFamily: "monospace" }}>
                            {order.productId.slice(0, 8)}...
                          </span>
                                            </td>
                                            <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#64748b" }}>
                            {order.titiperId.slice(0, 8)}...
                          </span>
                                            </td>
                                            <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#64748b" }}>
                            {order.jastiperId.slice(0, 8)}...
                          </span>
                                            </td>
                                            <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600 }}>
                                                {order.quantity}
                                            </td>
                                            <td style={{ padding: "12px 16px", whiteSpace: "nowrap", fontWeight: 700, color: "#1f2937" }}>
                                                {formatRupiah(order.totalPrice)}
                                            </td>
                                            <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                          <span style={{
                              padding: "4px 10px", borderRadius: "999px",
                              fontSize: "0.72rem", fontWeight: 700,
                              background: cfg.bg, color: cfg.color,
                          }}>
                            {cfg.emoji} {cfg.label}
                          </span>
                                            </td>
                                            <td style={{ padding: "12px 16px", whiteSpace: "nowrap", color: "#64748b", fontSize: "0.8rem" }}>
                                                {formatDate(order.createdAt)}
                                            </td>
                                            <td style={{ padding: "12px 16px" }}>
                                                {order.trackingNumber ? (
                                                    <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#7e22ce", fontWeight: 600 }}>
                              {order.trackingNumber}
                            </span>
                                                ) : (
                                                    <span style={{ color: "#cbd5e1", fontSize: "0.78rem" }}>-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer info */}
                <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.8rem", marginTop: "24px" }}>
                    Data diperbarui setiap kali halaman dimuat • Klik 🔄 Refresh untuk data terbaru
                </p>
            </div>
        </div>
    );
}