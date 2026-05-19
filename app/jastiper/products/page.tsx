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
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        targetId: ''
    });

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
            setModal({
                isOpen: true,
                title: "Gagal Memuat",
                message: "Koneksi ke server bermasalah.",
                type: 'info',
                targetId: ''
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const requestDelete = (id: string, name: string) => {
        setModal({
            isOpen: true,
            title: "Konfirmasi Hapus",
            message: `Apakah Anda yakin ingin menghapus "${name}" dari katalog?`,
            type: 'confirm',
            targetId: id
        });
    };

    const executeDelete = async () => {
        const id = modal.targetId;
        setModal({ ...modal, isOpen: false });

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
                setModal({
                    isOpen: true,
                    title: "Berhasil",
                    message: "Produk berhasil dihapus dari katalog.",
                    type: 'info',
                    targetId: ''
                });
                fetchMyProducts();
                
                if (currentProducts.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } else {
                setModal({
                    isOpen: true,
                    title: "Gagal Hapus",
                    message: "Gagal menghapus produk. Silakan coba lagi.",
                    type: 'info',
                    targetId: ''
                });
            }
        } catch (error) {
            setModal({
                isOpen: true,
                title: "Kesalahan Jaringan",
                message: "Terjadi kesalahan jaringan.",
                type: 'info',
                targetId: ''
            });
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <div className={styles.pageContainer}>
            {modal.isOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalCard}>
                        <h2 className={styles.modalTitle}>{modal.title}</h2>
                        <p className={styles.modalMessage}>{modal.message}</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            {modal.type === 'confirm' ? (
                                <>
                                    <button 
                                        className={styles.secondaryBtn}
                                        onClick={() => setModal({ ...modal, isOpen: false })}
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        className={styles.dangerBtn}
                                        style={{ backgroundColor: 'var(--color-danger)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px' }}
                                        onClick={executeDelete}
                                    >
                                        Hapus
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className={styles.primaryBtn}
                                    onClick={() => setModal({ ...modal, isOpen: false })}
                                >
                                    Mengerti
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                    <>
                        <div className={styles.listContainer}>
                            {currentProducts.map((product) => (
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
                                            onClick={() => requestDelete(product.id, product.name)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className={styles.paginationContainer} style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <button 
                                    className={styles.secondaryBtn} 
                                    onClick={handlePrevPage} 
                                    disabled={currentPage === 1}
                                    style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                >
                                    Sebelumnya
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                                    <button 
                                        key={num}
                                        onClick={() => setCurrentPage(num)}
                                        className={currentPage === num ? styles.primaryBtn : styles.secondaryBtn}
                                        style={{ width: '40px' }}
                                    >
                                        {num}
                                    </button>
                                ))}

                                <button 
                                    className={styles.secondaryBtn} 
                                    onClick={handleNextPage} 
                                    disabled={currentPage === totalPages}
                                    style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}