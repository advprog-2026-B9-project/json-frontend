"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../jastiper.module.css';

function ManageProductForm() {
    const router = useRouter();
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
                        alert("Gagal mengambil detail produk.");
                        router.push('/jastiper/products');
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setFetching(false);
                }
            };
            fetchProductDetail();
        }
    }, [productId, isEditMode, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            alert("Sesi Anda telah habis. Silakan login kembali.");
            router.push('/login');
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
            alert("Sesi tidak valid. Silakan login kembali.");
            router.push('/login');
            return;
        }

        if (parseInt(formData.stock) < 0) return alert("Stok minimal bernilai 0");
        if (parseFloat(formData.price) < 0) return alert("Harga tidak boleh negatif");

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
                alert(isEditMode ? "✅ Produk berhasil diperbarui!" : "✅ Produk berhasil ditambahkan!");
                router.push('/jastiper/products');
            } else {
                const errorText = await response.text();
                alert("Gagal menyimpan data: " + errorText);
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan koneksi sistem.");
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
        <Suspense fallback={<p>Memuat formulir...</p>}>
            <ManageProductForm />
        </Suspense>
    );
}