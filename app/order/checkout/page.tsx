"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../../products/titipers.module.css';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    originCountry: string;
    arrivalDate: string;
    ownerUsername: string;
    jastiperId: string;
}

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('productId');

    const [product, setProduct] = useState<Product | null>(null);
    const [titiperId, setTitiperId] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [quantity, setQuantity] = useState<number>(1);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', redirectPath: '' });
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                if (userData && userData.id) {
                    setTitiperId(userData.id);
                } else {
                    setModal({
                        isOpen: true,
                        title: "Sesi Tidak Valid",
                        message: "Gagal memuat profil user. Silakan login ulang.",
                        redirectPath: '/login'
                    });
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        if (!productId) {
            setLoading(false);
            return;
        }

        const fetchProductDetail = async () => {
            try {
                const response = await fetch(`${API_URL}/api/v1/products/${productId}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);
                } else {
                    setModal({
                        isOpen: true,
                        title: "Produk Tidak Ditemukan",
                        message: "Barang yang Anda coba checkout tidak tersedia.",
                        redirectPath: '/products'
                    });
                }
            } catch (error) {
                setModal({
                    isOpen: true,
                    title: "Koneksi Bermasalah",
                    message: "Gagal mengambil data produk.",
                    redirectPath: '/products'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetail();
    }, [productId, API_URL]);

    const handleIncreaseQty = () => {
        if (product && quantity < product.stock) {
            setQuantity(prev => prev + 1);
        }
    };

    const handleDecreaseQty = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleConfirmOrder = async () => {
        if (!product || !titiperId) return;

        setIsProcessing(true);
        try {
            const calculatedTotalPrice = product.price * quantity;

            const orderPayload = {
                productId: product.id,
                titiperId: titiperId,
                quantity: quantity,
                totalPrice: calculatedTotalPrice,
                status: "PENDING"
            };

            const response = await fetch(`${API_URL}/api/orders/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });

            if (response.ok) {
                setModal({
                    isOpen: true,
                    title: "Checkout Berhasil!",
                    message: "Pesanan Anda sukses dibuat dan saldo telah dipotong.",
                    redirectPath: '/wallet'
                });
            } else {
                const errorData = await response.text();
                setModal({
                    isOpen: true,
                    title: "Checkout Gagal",
                    message: `Transaksi ditolak: ${errorData}`,
                    redirectPath: ''
                });
            }
        } catch (error) {
            setModal({
                isOpen: true,
                title: "Koneksi Terputus",
                message: "Server gagal merespons. Pastikan backend menyala.",
                redirectPath: ''
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCloseModal = () => {
        const path = modal.redirectPath;
        setModal({ ...modal, isOpen: false });
        if (path) {
            router.push(path);
        }
    };

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.banner}></div>
                <p className={styles.centerMessage}>Menyiapkan halaman checkout...</p>
            </div>
        );
    }

    if (!product && !modal.isOpen) return null;

    return (
        <div className={styles.pageContainer}>
            {/* Pop up Modal */}
            {modal.isOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalCard}>
                        <h2 className={styles.modalTitle}>{modal.title}</h2>
                        <p className={styles.modalMessage}>{modal.message}</p>
                        <button className={styles.modalActionBtn} onClick={handleCloseModal}>
                            Mengerti
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.banner} style={{ height: '200px' }}>
                <h1 style={{ paddingTop: '50px', color: 'white', fontSize: '32px', textAlign: 'center' }}>
                    Ringkasan Pesanan
                </h1>
            </div>

            {product && (
                <div className={styles.detailContainer}>
                    <div className={styles.detailInfo} style={{ width: '100%' }}>
                        <h1 className={styles.detailTitle}>{product.name}</h1>

                        <div className={styles.specBox}>
                            <div className={styles.metaItem}>
                                Jastiper
                                <strong>@{product.ownerUsername}</strong>
                            </div>
                            <div className={styles.metaItem}>
                                Harga Satuan
                                <strong>Rp {product.price.toLocaleString('id-ID')}</strong>
                            </div>
                            <div className={styles.metaItem}>
                                Sisa Stok Tersedia
                                <strong style={{ color: product.stock > 0 ? 'inherit' : '#FF4757' }}>
                                    {product.stock} pcs
                                </strong>
                            </div>
                        </div>

                        {/* Bagian Atur Kuantitas */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            margin: '24px 0',
                            padding: '16px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '12px'
                        }}>
                            <span style={{ fontWeight: '600', fontSize: '16px' }}>Jumlah Pembelian</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <button
                                    onClick={handleDecreaseQty}
                                    disabled={quantity <= 1 || isProcessing}
                                    style={{
                                        width: '36px', height: '36px', borderRadius: '8px',
                                        border: '1px solid #ddd', backgroundColor: 'white',
                                        fontSize: '20px', cursor: quantity <= 1 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    -
                                </button>
                                <span style={{ fontSize: '18px', fontWeight: 'bold', width: '30px', textAlign: 'center' }}>
                                    {quantity}
                                </span>
                                <button
                                    onClick={handleIncreaseQty}
                                    disabled={quantity >= product.stock || isProcessing}
                                    style={{
                                        width: '36px', height: '36px', borderRadius: '8px',
                                        border: '1px solid #ddd', backgroundColor: 'white',
                                        fontSize: '20px', cursor: quantity >= product.stock ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Total Biaya */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px',
                            borderTop: '2px dashed #eee',
                            paddingTop: '24px'
                        }}>
                            <span style={{ fontSize: '18px', color: '#666' }}>Total Pembayaran</span>
                            <div className={styles.detailPrice} style={{ marginBottom: 0 }}>
                                Rp {(product.price * quantity).toLocaleString('id-ID')}
                            </div>
                        </div>

                        <button
                            className={styles.buyBtn}
                            onClick={handleConfirmOrder}
                            disabled={isProcessing || product.stock <= 0}
                            style={{ width: '100%', marginTop: '10px' }}
                        >
                            {isProcessing ? 'Memproses Pesanan...' : 'Konfirmasi & Bayar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}