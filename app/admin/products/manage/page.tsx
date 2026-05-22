"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/hooks/useModal';
import Modal from '@/components/Modal';
import styles from '../../admin.module.css'; 
import sharedStyles from '@/components/shared.module.css'; 

function AdminEditProductForm() {
    const router = useRouter();
    
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');

    const { isLoaded, isAuthenticated, user} = useAuth();
    const { modal, openModal, closeModal } = useModal();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        originCountry: '',
        arrivalDate: '',
        ownerId: ''
    });
    const [fetching, setFetching] = useState<boolean>(true);

    useEffect(() => {
        if (isLoaded) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'ADMIN') {
                router.push('/');
            }
        }
    }, [isLoaded, isAuthenticated, user, router]);

    useEffect(() => {
        if (!productId) {
            router.push('/admin/products');
            return;
        }

        const fetchProductDetail = async () => {
            try {
                setFetching(true);
                const response = await fetch(`${API_URL}/api/v1/products/${productId}`);
                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        name: data.name,
                        description: data.description,
                        price: data.price.toString(),
                        stock: data.stock.toString(),
                        originCountry: data.originCountry || '',
                        arrivalDate: data.arrivalDate || '',
                        ownerId: data.ownerId || ''
                    });
                } else {
                    openModal({
                        title: "Gagal Memuat",
                        message: "Produk tidak ditemukan atau telah dihapus.",
                        type: 'info',
                        redirectPath: '/admin/products'
                    });
                }
            } catch {
                openModal({
                    title: "Koneksi Terputus",
                    message: "Gagal terhubung ke server untuk mengambil data.",
                    type: 'info',
                    redirectPath: '/admin/products'
                });
            } finally {
                setFetching(false);
            }
        };

        if (isLoaded && isAuthenticated) {
            fetchProductDetail();
        }
    }, [productId, isLoaded, isAuthenticated, API_URL]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCloseModal = () => {
        const path = modal.redirectPath;
        closeModal();
        if (path) {
            router.push(path);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (parseInt(formData.stock) < 0) {
            openModal({ title: "Validasi Gagal", message: "Stok minimal bernilai 0", type: 'info' });
            return;
        }
        if (parseFloat(formData.price) < 0) {
            openModal({ title: "Validasi Gagal", message: "Harga tidak boleh negatif", type: 'info' });
            return;
        }

        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock)
        };

        try {
            const response = await fetch(`${API_URL}/api/v1/products/admin/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                openModal({
                    title: "Berhasil",
                    message: "Data produk berhasil diperbarui",
                    type: 'info',
                    redirectPath: '/admin/products'
                });
            } else {
                const errorText = await response.text();
                openModal({ title: "Gagal Menyimpan", message: `Server menolak perubahan: ${errorText}`, type: 'info' });
            }
        } catch {
            openModal({ title: "Kesalahan Sistem", message: "Gagal terhubung ke server saat memperbarui data.", type: 'info' });
        }
    };

    if (!isLoaded || !isAuthenticated) return null;

    if (fetching) {
        return (
            <div className={styles.pageContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <p style={{ color: 'var(--color-gray-text)' }}>Mengambil informasi data produk dari database...</p>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer} style={{ paddingTop: '40px' }}>
            <Modal 
                isOpen={modal.isOpen} 
                title={modal.title} 
                message={modal.message} 
                type={modal.type} 
                onClose={handleCloseModal} 
            />

            <div className={styles.card} style={{ margin: '0 auto', maxWidth: '900px' }}>
                <h1 className={styles.headerTitle} style={{ marginBottom: '10px' }}>Edit Produk</h1>
                <p style={{ color: '#6B7280', marginBottom: '30px', fontSize: '14px' }}>
                    Anda sedang mengubah paksa properti produk milik jastiper ID: <b>{formData.ownerId}</b>.
                </p>

                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Nama Produk *</label>
                        <input 
                            type="text" name="name" required maxLength={255}
                            className={styles.inputField}
                            value={formData.name} onChange={handleInputChange}
                        />
                    </div>

                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Deskripsi Produk *</label>
                        <textarea 
                            name="description" required rows={4}
                            className={styles.inputField} style={{ resize: 'vertical' }}
                            value={formData.description} onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Harga Produk (Rp) *</label>
                        <input 
                            type="number" name="price" required min="0" step="0.01"
                            className={styles.inputField}
                            value={formData.price} onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Stok / Kuota Bagasi *</label>
                        <input 
                            type="number" name="stock" required min="0"
                            className={styles.inputField}
                            value={formData.stock} onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Negara / Lokasi Asal Pembelian *</label>
                        <input 
                            type="text" name="originCountry" required
                            className={styles.inputField}
                            value={formData.originCountry} onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Tanggal Kembali / Tiba *</label>
                        <input 
                            type="date" name="arrivalDate" required
                            className={styles.inputField}
                            value={formData.arrivalDate} onChange={handleInputChange}
                        />
                    </div>

                    <div className={`${styles.formActions} ${styles.fullWidth}`}>
                        <button 
                            type="button" className={sharedStyles.secondaryBtn}
                            onClick={() => router.push('/admin/products')}
                        >
                            Batal
                        </button>
                        <button type="submit" className={sharedStyles.primaryBtn}>
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminEditProductPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}><p>Memuat formulir...</p></div>}>
            <AdminEditProductForm />
        </Suspense>
    );
}