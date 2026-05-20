"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/hooks/useModal';
import { usePagination } from '@/hooks/usePagination';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import styles from '../admin.module.css'; 
import sharedStyles from '@/components/shared.module.css'; 

interface ProductDetailResponse {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    originCountry: string;
    arrivalDate: string;
    jastiperUsername: string;
}

export default function ManageProductsPage() {
    const router = useRouter();
    const { isLoaded, isAuthenticated } = useAuth();
    const { modal, openModal, closeModal } = useModal();
    
    const [products, setProducts] = useState<ProductDetailResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [searchName, setSearchName] = useState('');
    const [searchJastiper, setSearchJastiper] = useState('');
    
    const { currentData, currentPage, totalPages, next, prev, goTo } = usePagination(products, 6);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    useEffect(() => {
        if (isLoaded && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoaded, isAuthenticated, router]);

    const fetchAllProducts = async (nameQuery = '', jastiperQuery = '') => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (nameQuery) queryParams.append('name', nameQuery);
            if (jastiperQuery) queryParams.append('jastiper', jastiperQuery);

            const url = `${API_URL}/api/v1/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await fetch(url);
            
            if (response.ok) {
                setProducts(await response.json());
            } else {
                openModal({ title: "Error", message: "Gagal mengambil data produk dari server.", type: 'info' });
            }
        } catch {
            openModal({ title: "Error", message: "Koneksi ke server bermasalah.", type: 'info' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && isAuthenticated) fetchAllProducts();
    }, [isLoaded, isAuthenticated]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        goTo(1); 
        fetchAllProducts(searchName, searchJastiper);
    };

    const executeDelete = async () => {
        const id = modal.targetId;
        closeModal();

        try {
            const response = await fetch(`${API_URL}/api/v1/products/admin/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                openModal({ title: "Berhasil", message: "Produk berhasil diturunkan (Take Down) dari sistem.", type: 'info' });
                fetchAllProducts(searchName, searchJastiper); 
                
                if (currentData.length === 1 && currentPage > 1) goTo(currentPage - 1);
            } else {
                openModal({ title: "Error", message: "Gagal menurunkan produk. Periksa kembali log server.", type: 'info' });
            }
        } catch {
            openModal({ title: "Error", message: "Terjadi kesalahan jaringan.", type: 'info' });
        }
    };

    if (!isLoaded || !isAuthenticated) return null;

    return (
        <>
            <Modal 
                isOpen={modal.isOpen} title={modal.title} message={modal.message} 
                type={modal.type} onClose={closeModal} onConfirm={executeDelete} 
            />

            <h1 className={styles.headerTitle}>Monitoring Inventory Produk</h1>

            <p style={{ color: '#6B7280', marginTop: '-20px', marginBottom: '30px', fontSize: '15px' }}>
                Gunakan halaman ini untuk memantau seluruh produk jastip di sistem. Admin dapat melakukan <b>Edit Paksa</b> atau <b>Take Down</b> jika produk melanggar syarat dan ketentuan (ilegal, penipuan, dsb).
            </p>

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
                <button type="submit" className={sharedStyles.primaryBtn} style={{ height: '42px', padding: '0 32px' }}>
                    Cari Produk
                </button>
            </form>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                    Memuat data produk...
                </div>
            ) : products.length === 0 ? (
                <div style={{
                    marginTop: '20px', padding: '40px 20px', border: '2px dashed #cbd5e1',
                    borderRadius: '12px', textAlign: 'center', backgroundColor: '#f8fafc'
                }}>
                    <span style={{ fontSize: '32px' }}>📦</span>
                    <h3 style={{ color: '#475569', marginTop: '10px' }}>Data Tidak Ditemukan</h3>
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>Belum ada produk yang sesuai dengan pencarian Anda.</p>
                </div>
            ) : (
                <>
                    <div className={styles.listContainer}>
                        {currentData.map((product) => (
                            <div key={product.id} className={styles.listItem} style={{ alignItems: 'flex-start' }}>
                                <div className={styles.itemLeft} style={{ width: '40%', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                                    <span className={styles.name}>{product.name}</span>
                                    <span className={styles.email} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {product.description}
                                    </span>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)', marginTop: '4px' }}>
                                        Jastiper: @{product.jastiperUsername}
                                    </span>
                                </div>
                                
                                <div className={styles.itemCenter} style={{ width: '20%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '11px', color: '#6B7280' }}>Harga Produk</span>
                                        <strong style={{ fontSize: '15px', color: 'var(--color-text-dark)' }}>Rp {product.price.toLocaleString('id-ID')}</strong>
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '11px', color: '#6B7280' }}>Sisa Kuota / Stok</span>
                                        <span style={{ fontSize: '14px', color: 'var(--color-text-dark)', fontWeight: 500 }}>{product.stock} pcs</span>
                                    </div>
                                </div>

                                <div className={styles.itemCenter} style={{ width: '20%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '11px', color: '#6B7280' }}>Negara Asal</span>
                                        <span style={{ fontSize: '14px', color: 'var(--color-text-dark)', fontWeight: 500 }}>{product.originCountry}</span>
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '11px', color: '#6B7280' }}>Tiba di Indonesia</span>
                                        <span style={{ fontSize: '14px', color: 'var(--color-text-dark)', fontWeight: 500 }}>{product.arrivalDate}</span>
                                    </div>
                                </div>

                                <div className={styles.itemRight} style={{ width: '20%', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                                    <button 
                                        className={sharedStyles.secondaryBtn} 
                                        style={{ width: '100%', padding: '10px' }}
                                        onClick={() => router.push(`/admin/products/manage?id=${product.id}`)}
                                    >
                                        Edit Data
                                    </button>
                                    <button 
                                        className={sharedStyles.dangerBtn} 
                                        style={{ width: '100%', padding: '10px' }}
                                        onClick={() => openModal({ title: "Take Down?", message: `Anda yakin ingin menghapus paksa produk "${product.name}"? Tindakan ini tidak dapat dibatalkan.`, type: 'confirm', targetId: product.id })}
                                    >
                                        Take Down
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination 
                        currentPage={currentPage} totalPages={totalPages} 
                        onNext={next} onPrev={prev} onGoTo={goTo} 
                    />
                </>
            )}
        </>
    );
}