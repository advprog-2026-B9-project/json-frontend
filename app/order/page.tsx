"use client";

import { useEffect, useState } from "react";
import styles from "./order.module.css";

interface Order {
  id: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  shippingAddress: string;
  status: string;
  trackingNumber?: string;
  jastiperRating?: number;
  productRating?: number;
}

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // TODO: Nanti ganti dengan UUID Titiper yang asli saat login sudah jalan
  const dummyTitiperId = "b9a0777e-c35d-49ca-ad25-015419c7bec6"; 

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/orders/history/${dummyTitiperId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data order:", error);
    }
    // setProducts([
    //   {
    //     id: "11111111-1111-1111-1111-111111111111",
    //     name: "Tokyo Banana Premium",
    //     price: 250000,
    //     stock: 15,
    //     jastiperId: "22222222-2222-2222-2222-222222222222",
    //   },
    //   {
    //     id: "33333333-3333-3333-3333-333333333333",
    //     name: "Garam Gourmet Limited",
    //     price: 850000,
    //     stock: 5,
    //     jastiperId: "44444444-4444-4444-4444-444444444444",
    //   },
    // ]);
    
    setLoading(false);
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm("Yakin mau membatalkan pesanan ini? Uang akan di-refund otomatis.")) return;
    
    try {
      const res = await fetch(`http://localhost:8080/api/orders/${orderId}/cancel`, { 
        method: "PATCH" 
      });
      
      if (res.ok) {
        alert("Pesanan berhasil dibatalkan!");
        fetchOrders(); // Refresh data biar statusnya jadi CANCELLED
      } else {
        alert("Gagal membatalkan pesanan. Cek status order.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRating = async (orderId: string) => {
    // Sederhana pakai prompt dulu (bisa diubah jadi Modal form nanti kalau mau A+)
    const jastiperRating = prompt("Masukkan rating untuk Pelayanan Jastiper (1-5):");
    if (!jastiperRating) return;

    const productRating = prompt("Masukkan rating untuk Kualitas Produk (1-5):");
    if (!productRating) return;

    try {
      // Panggil endpoint rating yang barusan kita bikin unit test-nya
      const res = await fetch(`http://localhost:8080/api/orders/${orderId}/rating?jastiperRating=${jastiperRating}&productRating=${productRating}`, {
        method: "PATCH"
      });

      if (res.ok) {
        alert("Terima kasih atas penilaian Anda!");
        fetchOrders(); // Refresh biar tombol rating hilang
      } else {
        alert("Gagal mengirim rating. Pastikan angka 1-5.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className={styles.container}><p>Memuat pesanan...</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Riwayat Pesanan Saya</h1>
      
      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Belum ada pesanan nih. Yuk hunting barang jastip!</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className={styles.card}>
            
            {/* Header: Order ID & Status */}
            <div className={styles.cardHeader}>
              <span className={styles.orderId}>ID: {order.id.split('-')[0]}...</span>
              <span className={`${styles.badge} ${styles[`badge${order.status}`]}`}>
                {order.status}
              </span>
            </div>

            {/* Konten Pesanan */}
            <div className={styles.details}>
              <p><strong>Total Harga:</strong> Rp {order.totalPrice.toLocaleString('id-ID')}</p>
              <p><strong>Jumlah Barang:</strong> {order.quantity} pcs</p>
              <p><strong>Alamat Pengiriman:</strong> {order.shippingAddress}</p>
              {order.trackingNumber && (
                <p><strong>Nomor Resi:</strong> {order.trackingNumber}</p>
              )}
            </div>

            {/* Area Tombol Aksi */}
            <div className={styles.actionGroup}>
              {/* Tombol Cancel cuma muncul kalau masih PAID */}
              {order.status === "PAID" && (
                <button onClick={() => handleCancel(order.id)} className={styles.btnCancel}>
                  Batalkan Pesanan
                </button>
              )}

              {/* Tombol Rating cuma muncul kalau udah COMPLETED dan belum dirating */}
              {order.status === "COMPLETED" && !order.jastiperRating && (
                <button onClick={() => handleRating(order.id)} className={styles.btnRate}>
                  Beri Penilaian
                </button>
              )}

              {/* Kalau udah dirating, tampilin Bintangnya */}
              {order.status === "COMPLETED" && order.jastiperRating && (
                <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>
                  ★ Jastiper: {order.jastiperRating}/5 | ★ Produk: {order.productRating}/5
                </p>
              )}
            </div>

          </div>
        ))
      )}
    </div>
  );
}