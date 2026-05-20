"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/hooks/useModal';
import { usePagination } from '@/hooks/usePagination';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import styles from './jastiper.module.css';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    originCountry: string;
    arrivalDate: string;
}

export default function JastiperDashboard() {
    const router = useRouter();
    const { username, isLoaded, isAuthenticated, user } = useAuth();
    const { modal, openModal, closeModal } = useModal();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    const { currentData, currentPage, totalPages, next, prev, goTo } = usePagination(products, 5);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    useEffect(() => {
        if (isLoaded) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'JASTIPER') {
                router.push('/');
            }
        }
    }, [isLoaded, isAuthenticated, user, router]);

    const fetchMyProducts = async () => {
        if (!username) return;
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/v1/products/me`, {
                headers: { 'X-User-Name': username }
            });
            if (response.ok) setProducts(await response.json());
        } catch {
            openModal({ title: "Error", message: "Koneksi ke server bermasalah.", type: 'info' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (username) fetchMyProducts();
    }, [username]);

    const executeDelete = async () => {
        const id = modal.targetId;
        closeModal();

        try {
            const response = await fetch(`${API_URL}/api/v1/products/${id}`, {
                method: 'DELETE',
                headers: { 'X-User-Name': username }
            });

            if (response.ok) {
                openModal({ title: "Berhasil", message: "Produk dihapus.", type: 'info' });
                fetchMyProducts();
                if (currentData.length === 1 && currentPage > 1) goTo(currentPage - 1);
            }
        } catch {
            openModal({ title: "Error", message: "Gagal menghapus produk.", type: 'info' });
        }
    };

    if (!isLoaded || !isAuthenticated) return null;

    return (
        <div className={styles.pageContainer}>
            <Modal 
                isOpen={modal.isOpen} title={modal.title} message={modal.message} 
                type={modal.type} onClose={closeModal} onConfirm={executeDelete} 
            />

            <div className={styles.banner}></div>
            <div className={styles.card}>
                <div className={styles.headerRow}>
                    <h1 className={styles.headerTitle}>Katalog Dagangan Saya</h1>
                    <button className={styles.primaryBtn} onClick={() => router.push('/jastiper/products/manage')}>
                        + Tambah Produk Baru
                    </button>
                </div>

                {loading ? (
                    <p className={styles.centerMessage}>Memuat katalog...</p>
                ) : products.length === 0 ? (
                    <p className={styles.centerMessage}>Belum ada produk. Silakan tambah!</p>
                ) : (
                    <>
                        <div className={styles.listContainer}>
                            {currentData.map((product) => (
                                <div key={product.id} className={styles.productRow}>
                                    <div className={styles.productMainInfo}>
                                        <span className={styles.productName}>{product.name}</span>
                                        <span className={styles.productDesc}>{product.description}</span>
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
                                            onClick={() => openModal({ title: "Hapus?", message: `Hapus ${product.name}?`, type: 'confirm', targetId: product.id })}
                                        >
                                            Delete
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
            </div>
        </div>
    );
}