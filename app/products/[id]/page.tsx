"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from '../titipers.module.css';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    originCountry: string;
    arrivalDate: string;
    ownerId: string;
    averageRating: number;
    totalReviews: number;
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [loggedInUserId, setLoggedInUserId] = useState<string>('');
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', redirectPath: '' });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                const activeUserId = userData?.id || userData?.userId || '';
                if (activeUserId) {
                    setLoggedInUserId(activeUserId);
                }
            } catch (error) {
                console.error(error);
            }
        }
    }, []);

    useEffect(() => {
        if (!id) return;

        const fetchProductDetail = async () => {
            try {
                const response = await fetch(`${API_URL}/api/v1/products/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);
                } else {
                    setModal({
                        isOpen: true,
                        title: "Produk Tidak Ditemukan",
                        message: "Produk yang Anda cari tidak tersedia atau telah dihapus.",
                        redirectPath: '/products'
                    });
                }
            } catch (error) {
                setModal({
                    isOpen: true,
                    title: "Koneksi Bermasalah",
                    message: "Gagal mengambil detail produk. Silakan coba lagi.",
                    redirectPath: '/products'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetail();
    }, [id, API_URL]);

    const handleCheckout = () => {
        if (!loggedInUserId) {
            setModal({
                isOpen: true,
                title: "Akses Ditolak",
                message: "Anda harus login sebagai Titipers untuk membeli barang.",
                redirectPath: '/login'
            });
            return;
        }
        router.push(`/order/checkout?productId=${id}`);
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
                <p className={styles.centerMessage}>Memuat rincian produk...</p>
            </div>
        );
    }

    if (!product && !modal.isOpen) return null;

    const isOwner = product ? loggedInUserId === product.ownerId : false;

    return (
        <div className={styles.pageContainer}>
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

            <div className={styles.banner} style={{ height: '200px' }}></div>
            
            {product && (
                <div className={styles.detailContainer}>
                    <div className={styles.detailImage}></div>
                    
                    <div className={styles.detailInfo}>
                        <h1 className={styles.detailTitle}>{product.name}</h1>
                        <div className={styles.detailPrice}>
                            Rp {product.price.toLocaleString('id-ID')}
                        </div>
                        
                        <p className={styles.detailDesc}>{product.description}</p>
                        
                        <div className={styles.specBox}>
                            <div className={styles.metaItem}>
                                Jastiper ID
                                <strong>{product.ownerId}</strong>
                            </div>
                            <div className={styles.metaItem}>
                                Rating
                                <strong>★ {product.averageRating > 0 ? product.averageRating.toFixed(1) : 'Belum ada ulasan'} ({product.totalReviews})</strong>
                            </div>
                            <div className={styles.metaItem}>
                                Negara Asal
                                <strong>{product.originCountry}</strong>
                            </div>
                            <div className={styles.metaItem}>
                                Tiba di Indonesia
                                <strong>{product.arrivalDate}</strong>
                            </div>
                            <div className={styles.metaItem}>
                                Sisa Kuota
                                <strong style={{ color: product.stock > 0 ? 'inherit' : '#FF4757' }}>
                                    {product.stock > 0 ? `${product.stock} pcs` : 'Habis Terjual'}
                                </strong>
                            </div>
                        </div>

                        <button 
                            className={styles.buyBtn} 
                            onClick={handleCheckout}
                            disabled={product.stock <= 0 || isOwner}
                        >
                            {isOwner ? 'Barang Anda Sendiri' : product.stock > 0 ? 'Checkout Barang' : 'Stok Habis'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}