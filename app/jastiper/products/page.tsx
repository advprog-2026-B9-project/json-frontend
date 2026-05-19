"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './jastiper.module.css';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    originCountry: string;
    arrivalDate: string;
    averageRating: number;
}

export default function JastiperDashboard() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const fetchMyProducts = async () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }

        try {
            const userData = JSON.parse(storedUser);
            const activeUsername = userData?.username;
            if (!activeUsername) {
                router.push('/login');
                return;
            }

            setLoading(true);
            const response = await fetch(`${API_URL}/api/v1/products/me`, {
                headers: { 'X-User-Name': activeUsername }
            });
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Gagal memuat produk:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus "${name}" dari katalog?`)) return;

        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }

        try {
            const userData = JSON.parse(storedUser);
            const activeUsername = userData?.username;
            if (!activeUsername) return;

            const response = await fetch(`${API_URL}/api/v1/products/${id}`, {
                method: 'DELETE',
                headers: { 'X-User-Name': activeUsername }
            });

            if (response.ok) {
                alert("✅ Produk berhasil dihapus.");
                fetchMyProducts();
            } else {
                alert("❌ Gagal menghapus produk.");
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan jaringan.");
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.banner}></div>
            <div className={styles.card}>
                <div className={styles.headerRow}>
                    <h1 className={styles.headerTitle}>Katalog Dagangan Saya</h1>
                    <button 
                        className={styles.primaryBtn}
                        onClick={() => router.push('/jastiper/products/manage')}
                    >
                        + Tambah Produk Baru
                    </button>
                </div>

                {loading ? (
                    <p className={styles.centerMessage}>Sedang memuat katalog produk...</p>
                ) : products.length === 0 ? (
                    <p className={styles.centerMessage}>Belum ada produk di katalog Anda. Silakan tambah produk baru!</p>
                ) : (
                    <div className={styles.listContainer}>
                        {products.map((product) => (
                            <div key={product.id} className={styles.productRow}>
                                <div className={styles.productMainInfo}>
                                    <span className={styles.productName}>{product.name}</span>
                                    <span className={styles.productDesc}>{product.description}</span>
                                </div>
                                <div className={styles.productMeta}>
                                    <span className={styles.metaLabel}>Harga</span>
                                    <strong>Rp {product.price.toLocaleString('id-ID')}</strong>
                                </div>
                                <div className={styles.productMeta}>
                                    <span className={styles.metaLabel}>Stok Kuota</span>
                                    <span>{product.stock} pcs</span>
                                </div>
                                <div className={styles.productMeta}>
                                    <span className={styles.metaLabel}>Asal / Kembali</span>
                                    <span>{product.originCountry} ({product.arrivalDate})</span>
                                </div>
                                <div className={styles.actionGroup}>
                                    <button 
                                        className={styles.secondaryBtn}
                                        onClick={() => router.push(`/jastiper/products/manage?id=${product.id}`)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className={styles.dangerBtn}
                                        onClick={() => handleDelete(product.id, product.name)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}