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
    ownerUsername: string;
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

    useEffect(() => {
        if (!id) return;

        const fetchProductDetail = async () => {
            try {
                const response = await fetch(`${API_URL}/api/v1/products/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);
                } else {
                    alert("Produk tidak ditemukan.");
                    router.push('/products');
                }
            } catch (error) {
                console.error("Gagal mengambil detail produk:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetail();
    }, [id, router]);

    const handleCheckout = () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            alert("Anda harus login sebagai Titipers untuk membeli barang.");
            router.push('/login');
            return;
        }

        const userData = JSON.parse(storedUser);
        if (userData?.username === product?.ownerUsername) {
            alert("Constraint Error: Jastiper tidak boleh membeli barangnya sendiri.");
            return;
        }

        router.push(`/order/checkout?productId=${id}`);
    };

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.banner}></div>
                <p className={styles.centerMessage}>Memuat rincian produk...</p>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.banner} style={{ height: '200px' }}></div>
            
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
                            Jastiper
                            <strong>@{product.ownerUsername}</strong>
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
                        disabled={product.stock <= 0}
                    >
                        {product.stock > 0 ? 'Checkout Barang' : 'Stok Habis'}
                    </button>
                </div>
            </div>
        </div>
    );
}