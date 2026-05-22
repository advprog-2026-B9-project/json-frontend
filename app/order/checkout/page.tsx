"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../../products/titipers.module.css';

interface Product {
    id: string; name: string; description: string; price: number;
    stock: number; originCountry: string; arrivalDate: string;
    ownerUsername: string; jastiperId: string;
}

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('productId');
    const [product, setProduct] = useState<Product | null>(null);
    const [titiperId, setTitiperId] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [quantity, setQuantity] = useState<number>(1);
    const [shippingAddress, setShippingAddress] = useState<string>('');
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', redirectPath: '' });
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                if (userData && userData.id) {
                    setTitiperId(userData.id);
                    if (userData.address) setShippingAddress(userData.address);
                } else {
                    setModal({ isOpen: true, title: "Sesi Tidak Valid", message: "Gagal memuat profil user. Silakan login ulang.", redirectPath: '/login' });
                }
            } catch (error) { console.error(error); }
        } else { router.push('/login'); }
    }, [router]);

    useEffect(() => {
        if (!productId) { setLoading(false); return; }
        const fetchProductDetail = async () => {
            try {
                const response = await fetch(`${API_URL}/api/v1/products/${productId}`);
                if (response.ok) { setProduct(await response.json()); }
                else { setModal({ isOpen: true, title: "Produk Tidak Ditemukan", message: "Barang yang Anda coba checkout tidak tersedia.", redirectPath: '/products' }); }
            } catch {
                setModal({ isOpen: true, title: "Koneksi Bermasalah", message: "Gagal mengambil data produk.", redirectPath: '/products' });
            } finally { setLoading(false); }
        };
        fetchProductDetail();
    }, [productId, API_URL]);

    const handleConfirmOrder = async () => {
        if (!product || !titiperId) return;
        if (!shippingAddress.trim()) {
            setModal({ isOpen: true, title: "Alamat Diperlukan", message: "Mohon isi alamat pengiriman sebelum melanjutkan.", redirectPath: '' });
            return;
        }
        setIsProcessing(true);
        try {
            const response = await fetch(`${API_URL}/api/v1/orders/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id, titiperId, quantity,
                    totalPrice: product.price * quantity,
                    shippingAddress: shippingAddress.trim(),
                    productName: product.name,
                    jastiperId: product.jastiperId,
                    jastiperUsername: product.ownerUsername
                })
            });
            if (response.ok) {
                setModal({ isOpen: true, title: "Checkout Berhasil! 🎉", message: "Pesanan Anda sukses dibuat dan saldo telah dipotong.", redirectPath: '/order/history' });
            } else {
                const errorData = await response.text();
                setModal({ isOpen: true, title: "Checkout Gagal", message: `Transaksi ditolak: ${errorData}`, redirectPath: '' });
            }
        } catch {
            setModal({ isOpen: true, title: "Koneksi Terputus", message: "Server gagal merespons.", redirectPath: '' });
        } finally { setIsProcessing(false); }
    };

    const handleCloseModal = () => {
        const path = modal.redirectPath;
        setModal({ ...modal, isOpen: false });
        if (path) router.push(path);
    };

    if (loading) return (
        <div className={styles.pageContainer}><div className={styles.banner}></div><p className={styles.centerMessage}>Menyiapkan halaman checkout...</p></div>
    );
    if (!product && !modal.isOpen) return null;

    return (
        <div className={styles.pageContainer}>
            {modal.isOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalCard}>
                        <h2 className={styles.modalTitle}>{modal.title}</h2>
                        <p className={styles.modalMessage}>{modal.message}</p>
                        <button className={styles.modalActionBtn} onClick={handleCloseModal}>Mengerti</button>
                    </div>
                </div>
            )}
            <div className={styles.banner} style={{ height: '200px' }}>
                <h1 style={{ paddingTop: '50px', color: 'white', fontSize: '32px', textAlign: 'center' }}>Ringkasan Pesanan</h1>
            </div>
            {product && (
                <div className={styles.detailContainer}>
                    <div className={styles.detailInfo} style={{ width: '100%' }}>
                        <h1 className={styles.detailTitle}>{product.name}</h1>
                        <div className={styles.specBox}>
                            <div className={styles.metaItem}>Jastiper<strong>@{product.ownerUsername}</strong></div>
                            <div className={styles.metaItem}>Harga Satuan<strong>Rp {product.price.toLocaleString('id-ID')}</strong></div>
                            <div className={styles.metaItem}>Sisa Stok<strong style={{ color: product.stock > 0 ? 'inherit' : '#FF4757' }}>{product.stock} pcs</strong></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 0', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                            <span style={{ fontWeight: '600', fontSize: '16px' }}>Jumlah Pembelian</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <button onClick={() => quantity > 1 && setQuantity(q => q - 1)} disabled={quantity <= 1 || isProcessing}
                                        style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white', fontSize: '20px', cursor: quantity <= 1 ? 'not-allowed' : 'pointer' }}>−</button>
                                <span style={{ fontSize: '18px', fontWeight: 'bold', width: '30px', textAlign: 'center' }}>{quantity}</span>
                                <button onClick={() => product && quantity < product.stock && setQuantity(q => q + 1)} disabled={quantity >= product.stock || isProcessing}
                                        style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white', fontSize: '20px', cursor: quantity >= product.stock ? 'not-allowed' : 'pointer' }}>+</button>
                            </div>
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontWeight: '600', fontSize: '15px', marginBottom: '8px', color: '#1f2937' }}>
                                Alamat Pengiriman <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)}
                                      placeholder="Contoh: Jl. Margonda Raya No. 100, Depok, Jawa Barat"
                                      disabled={isProcessing} rows={3}
                                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: '#374151' }}
                                      onFocus={(e) => e.target.style.borderColor = '#8F39DF'}
                                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderTop: '2px dashed #eee', paddingTop: '24px' }}>
                            <span style={{ fontSize: '18px', color: '#666' }}>Total Pembayaran</span>
                            <div className={styles.detailPrice} style={{ marginBottom: 0 }}>Rp {(product.price * quantity).toLocaleString('id-ID')}</div>
                        </div>
                        <button className={styles.buyBtn} onClick={handleConfirmOrder} disabled={isProcessing || product.stock <= 0} style={{ width: '100%', marginTop: '10px' }}>
                            {isProcessing ? 'Memproses Pesanan...' : 'Konfirmasi & Bayar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Memuat halaman checkout...</p>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}