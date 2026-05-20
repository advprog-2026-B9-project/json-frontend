"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../jastiper.module.css';
import { useAuth } from '@/hooks/useAuth';

function ManageProductForm() {
    const router = useRouter();
    const { isLoaded, isAuthenticated, user } = useAuth();
    
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
    
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        redirectPath: ''
    });

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
                        setModal({
                            isOpen: true,
                            title: "Gagal Memuat",
                            message: "Gagal mengambil detail produk. Produk mungkin telah dihapus.",
                            redirectPath: '/jastiper/products'
                        });
                    }
                } catch (error) {
                    console.error(error);
                    setModal({
                        isOpen: true,
                        title: "Koneksi Bermasalah",
                        message: "Tidak dapat terhubung ke server.",
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
        setModal({ ...modal, isOpen: false });
        if (path) {
            router.push(path);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            setModal({
                isOpen: true,
                title: "Sesi Berakhir",
                message: "Sesi Anda telah habis. Silakan login kembali.",
                redirectPath: '/login'
            });
            return;
        }

        let activeUsername = '';
        try {
            const userData = JSON.parse(storedUser);
            activeUsername = userData?.username;
            if (!activeUsername) {
                throw new Error("Username tidak ditemukan");
            }
        } catch (error) {
            setModal({
                isOpen: true,
                title: "Sesi Tidak Valid",
                message: "Data sesi Anda rusak. Silakan login kembali.",
                redirectPath: '/login'
            });
            return;
        }

        if (parseInt(formData.stock) < 0) {
            setModal({
                isOpen: true,
                title: "Validasi Gagal",
                message: "Stok minimal bernilai 0",
                redirectPath: ''
            });
            return;
        }
        
        if (parseFloat(formData.price) < 0) {
            setModal({
                isOpen: true,
                title: "Validasi Gagal",
                message: "Harga tidak boleh negatif",
                redirectPath: ''
            });
            return;
        }

        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            ownerUsername: activeUsername
        };

        const url = isEditMode ? `${API_URL}/api/v1/products/${productId}` : `${API_URL}/api/v1/products`;
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Name': activeUsername
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setModal({
                    isOpen: true,
                    title: "Berhasil!",
                    message: isEditMode ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan ke katalog!",
                    redirectPath: '/jastiper/products'
                });
            } else {
                const errorText = await response.text();
                setModal({
                    isOpen: true,
                    title: "Gagal Menyimpan",
                    message: `Gagal menyimpan data: ${errorText}`,
                    redirectPath: ''
                });
            }
        } catch (error) {
            console.error(error);
            setModal({
                isOpen: true,
                title: "Kesalahan Sistem",
                message: "Terjadi kesalahan koneksi sistem saat menyimpan data.",
                redirectPath: ''
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
            {/* Modal Handler */}
            {modal.isOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalCard}>
                        <h2 className={styles.modalTitle}>{modal.title}</h2>
                        <p className={styles.modalMessage} style={{ textAlign: 'center', marginBottom: '24px' }}>
                            {modal.message}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button 
                                className={styles.primaryBtn}
                                onClick={handleCloseModal}
                            >
                                Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}

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