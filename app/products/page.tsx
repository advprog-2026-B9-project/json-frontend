"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './titipers.module.css';

interface ProductDetailResponse {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    originCountry: string;
    arrivalDate: string;
    averageRating: number;
    totalReviews: number;
    jastiperUsername: string;
    jastiperFullName: string;
}

export default function ProductSearchPage() {
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const [products, setProducts] = useState<ProductDetailResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    const [searchName, setSearchName] = useState('');
    const [searchJastiper, setSearchJastiper] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; 

    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });

    const fetchProducts = async (nameQuery = '', jastiperQuery = '') => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (nameQuery) queryParams.append('name', nameQuery);
            if (jastiperQuery) queryParams.append('jastiper', jastiperQuery);

            const url = `${API_URL}/api/v1/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            } else {
                setModal({
                    isOpen: true,
                    title: "Gagal Memuat Data",
                    message: "Terjadi kesalahan pada server. Silakan coba lagi nanti."
                });
            }
        } catch (error) {
            setModal({
                isOpen: true,
                title: "Koneksi Terputus",
                message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchProducts(searchName, searchJastiper);
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
            {/* Modal Handler */}
            {modal.isOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalCard}>
                        <h2 className={styles.modalTitle}>{modal.title}</h2>
                        <p className={styles.modalMessage}>{modal.message}</p>
                        <button 
                            className={styles.modalActionBtn}
                            onClick={() => setModal({ ...modal, isOpen: false })}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.banner}>
                <h1 className={styles.bannerTitle}>Eksplorasi Barang Jastip</h1>
                <p className={styles.bannerSubtitle}>Temukan barang impianmu dari berbagai negara melalui Jastiper terpercaya.</p>
            </div>

            <form onSubmit={handleSearch} className={styles.searchCard}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Nama Barang</label>
                    <input 
                        type="text" 
                        className={styles.inputField} 
                        placeholder="Cari nama barang..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Username Jastiper</label>
                    <input 
                        type="text" 
                        className={styles.inputField} 
                        placeholder="Cari jastiper spesifik..."
                        value={searchJastiper}
                        onChange={(e) => setSearchJastiper(e.target.value)}
                    />
                </div>
                <button type="submit" className={styles.searchBtn}>
                    Cari Barang
                </button>
            </form>

            <main className={styles.mainContent}>
                {loading ? (
                    <div className={styles.productGrid}>
                        <p className={styles.centerMessage}>Memuat katalog barang...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className={styles.productGrid}>
                        <p className={styles.centerMessage}>Tidak ada barang yang sesuai dengan pencarian Anda.</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.productGrid}>
                            {currentProducts.map((product) => (
                                <div 
                                    key={product.id} 
                                    className={styles.productCard}
                                    onClick={() => router.push(`/products/${product.id}`)}
                                >
                                    <div className={styles.imagePlaceholder}>
                                        No Image Available
                                    </div>
                                    <div className={styles.cardBody}>
                                        <h3 className={styles.productName}>{product.name}</h3>
                                        <div className={styles.productPrice}>
                                            Rp {product.price.toLocaleString('id-ID')}
                                        </div>
                                        <div className={styles.metaGrid}>
                                            <div className={styles.metaItem}>
                                                Asal
                                                <strong>{product.originCountry}</strong>
                                            </div>
                                            <div className={styles.metaItem}>
                                                Sisa Kuota
                                                <strong>{product.stock} pcs</strong>
                                            </div>
                                        </div>
                                        <div className={styles.cardFooter}>
                                            <span className={styles.jastiperName}>
                                                Oleh: {product.jastiperUsername}
                                            </span>
                                            <span className={styles.rating}>
                                                ★ {product.averageRating > 0 ? product.averageRating.toFixed(1) : 'New'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Kontrol Navigasi Paging */}
                        {totalPages > 1 && (
                            <div className={styles.paginationContainer}>
                                <button 
                                    className={styles.pageBtn} 
                                    onClick={handlePrevPage} 
                                    disabled={currentPage === 1}
                                >
                                    Sebelumnya
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                                    <button 
                                        key={num}
                                        onClick={() => setCurrentPage(num)}
                                        className={`${styles.pageBtn} ${currentPage === num ? styles.activePage : ''}`}
                                    >
                                        {num}
                                    </button>
                                ))}

                                <button 
                                    className={styles.pageBtn} 
                                    onClick={handleNextPage} 
                                    disabled={currentPage === totalPages}
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}