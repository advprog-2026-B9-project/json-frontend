"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../jastiper.module.css';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/hooks/useModal';
import Modal from '@/components/Modal';

function ManageProductForm() {
    const router = useRouter();
    const { isLoaded, isAuthenticated, user } = useAuth();
    const { modal, openModal, closeModal } = useModal();
    
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');
    const isEditMode = !!productId;
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        originCountry: '',
        arrivalDate: ''
    });
    
    const [fetching, setFetching] = useState<boolean>(false);

    useEffect(() => {
        if (isLoaded) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'JASTIPER') {
                router.push('/');
            }
        }
    }, [isLoaded, isAuthenticated, user, router]);

    useEffect(() => {
        if (isEditMode) {
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
                            arrivalDate: data.arrivalDate || ''
                        });
                    } else {
                        openModal({
                            title: "Gagal Memuat",
                            message: "Gagal mengambil detail produk. Produk mungkin telah dihapus.",
                            type: 'info',
                            redirectPath: '/jastiper/products'
                        });
                    }
                } catch (error) {
                    openModal({
                        title: "Koneksi Bermasalah",
                        message: "Tidak dapat terhubung ke server.",
                        type: 'info',
                        redirectPath: '/jastiper/products'
                    });
                } finally {
                    setFetching(false);
                }
            };
            fetchProductDetail();
        }
    }, [productId, isEditMode, API_URL]);

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

        const storedUser = localStorage.getItem('user');
        let activeUserId = '';

        try {
            if (!storedUser) throw new Error("Tidak ada data user");
            
            const userData = JSON.parse(storedUser);
            
            activeUserId = userData?.id || userData?.userId; 

            if (!activeUserId) {
                throw new Error("ID pengguna tidak ditemukan di dalam sesi");
            }
        } catch (error) {
            openModal({
                title: "Sesi Tidak Valid",
                message: "Data sesi Anda rusak atau ID tidak ditemukan. Silakan login kembali.",
                type: 'info',
                redirectPath: '/login'
            });
            return;
        }

        if (parseInt(formData.stock) < 0) {
            openModal({
                title: "Validasi Gagal",
                message: "Stok minimal bernilai 0",
                type: 'info'
            });
            return;
        }
        
        if (parseFloat(formData.price) < 0) {
            openModal({
                title: "Validasi Gagal",
                message: "Harga tidak boleh negatif",
                type: 'info'
            });
            return;
        }

        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock)
        };

        const url = isEditMode ? `${API_URL}/api/v1/products/${productId}` : `${API_URL}/api/v1/products`;
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': String(activeUserId)
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                openModal({
                    title: "Berhasil!",
                    message: isEditMode ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan ke katalog!",
                    type: 'info',
                    redirectPath: '/jastiper/products'
                });
            } else {
                const errorText = await response.text();
                openModal({
                    title: "Gagal Menyimpan",
                    message: `Gagal menyimpan data: ${errorText}`,
                    type: 'info'
                });
            }
        } catch (error) {
            openModal({
                title: "Kesalahan Sistem",
                message: "Terjadi kesalahan koneksi sistem saat menyimpan data.",
                type: 'info'
            });
        }
    };

    if (fetching) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.banner}></div>
                <div className={styles.card}>
                    <p className={styles.centerMessage}>Mengambil data produk terdaftar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <Modal 
                isOpen={modal.isOpen} 
                title={modal.title} 
                message={modal.message} 
                type={modal.type || 'info'} 
                onClose={handleCloseModal} 
            />

            <div className={styles.banner}></div>
            <div className={styles.card}>
                <h1 className={styles.headerTitle} style={{ marginBottom: '30px' }}>
                    {isEditMode ? 'Edit Informasi Produk' : 'Buat Katalog Produk Jastip'}
                </h1>

                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Nama Produk *</label>
                        <input 
                            type="text" name="name" required maxLength={255}
                            className={styles.inputField} placeholder="Contoh: Sushi Roll Premium Halal Tokyo"
                            value={formData.name} onChange={handleInputChange}
                        />
                    </div>

                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Deskripsi Produk *</label>
                        <textarea 
                            name="description" required rows={4}
                            className={styles.inputField} style={{ resize: 'vertical' }}
                            placeholder="Tuliskan spesifikasi detail barang titipan..."
                            value={formData.description} onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Harga Produk (Rp) *</label>
                        <input 
                            type="number" name="price" required min="0" step="0.01"
                            className={styles.inputField} placeholder="0"
                            value={formData.price} onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Stok / Kuota Bagasi *</label>
                        <input 
                            type="number" name="stock" required min="0"
                            className={styles.inputField} placeholder="0"
                            value={formData.stock} onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Negara / Lokasi Asal Pembelian *</label>
                        <input 
                            type="text" name="originCountry" required
                            disabled={isEditMode}
                            className={styles.inputField} placeholder="Contoh: Jepang"
                            value={formData.originCountry} onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Tanggal Kembali / Tiba *</label>
                        <input 
                            type="date" name="arrivalDate" required
                            disabled={isEditMode}
                            className={styles.inputField}
                            value={formData.arrivalDate} onChange={handleInputChange}
                        />
                    </div>

                    <div className={`${styles.formActions} ${styles.fullWidth}`}>
                        <button 
                            type="button" className={styles.secondaryBtn}
                            onClick={() => router.push('/jastiper/products')}
                        >
                            Batal
                        </button>
                        <button type="submit" className={styles.primaryBtn}>
                            {isEditMode ? 'Simpan Perubahan' : 'Rilis ke Katalog'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ManageProductPage() {
    return (
        <Suspense fallback={<div className={styles.pageContainer}><p className={styles.centerMessage}>Memuat formulir...</p></div>}>
            <ManageProductForm />
        </Suspense>
    );
}