"use client";
import React, { useState, useEffect } from 'react';
import styles from './admin.module.css';

interface User {
    id: string;
    nikKtp: string;
    fullName: string;
    email: string;
    ktpImageUrl: string;
    kycStatus: string;
}

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'verification' | 'users' | 'other'>('verification');
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/auth/admin/kyc/pending`);
            if (response.ok) {
                const data: User[] = await response.json();

                setPendingUsers(data);
            }
        } catch (error) {
            console.error("Gagal mengambil data user:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleReview = async (email: string, isApproved: boolean) => {
        const confirmMsg = isApproved ? "Apakah Anda yakin ingin MENYETUJUI user ini?" : "Apakah Anda yakin ingin MENOLAK user ini?";
        if (!window.confirm(confirmMsg)) return;

        try {
            const response = await fetch(`${API_URL}/auth/admin/kyc/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, approved: isApproved }),
            });

            if (response.ok) {
                alert(isApproved ? "✅ User berhasil diverifikasi!" : "❌ User ditolak.");
                // Refresh data agar user yang sudah direview hilang dari daftar
                fetchUsers();
            } else {
                const msg = await response.text();
                alert("Gagal memproses: " + msg);
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan koneksi saat memproses review.");
        }
    };

    return (
        <div className={styles.pageContainer}>
            {/* Banner ungu gradient */}
            <div className={styles.banner}></div>

            {/* Container Card Putih */}
            <div className={styles.card}>

                {/* Navigasi Tabs Dinamis */}
                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tab} ${activeTab === 'verification' ? styles.tabActive : styles.tabInactive}`}
                        onClick={() => setActiveTab('verification')}
                    >
                        Verification
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'users' ? styles.tabActive : styles.tabInactive}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'other' ? styles.tabActive : styles.tabInactive}`}
                        onClick={() => setActiveTab('other')}
                    >
                        Other
                    </button>
                </div>

                {/* Judul Halaman */}
                <h1 className={styles.headerTitle}>Verifikasi Jastiper</h1>

                {/* State Loading & Kosong */}
                {loading ? (
                    <p style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>Sedang memuat data...</p>
                ) : pendingUsers.length === 0 ? (
                    <p style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>
                        Tidak ada pengajuan verifikasi baru saat ini.
                    </p>
                ) : (
                    /* Daftar Pengajuan KYC dari Backend */
                    <div className={styles.listContainer}>
                        {pendingUsers.map((user) => (
                            <div key={user.id} className={styles.listItem}>

                                {/* Bagian Kiri: Foto dan Data Diri */}
                                <div className={styles.itemLeft}>
                                    <img
                                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName || user.email}&backgroundColor=8F39DF`}
                                        alt={`Foto profil ${user.fullName}`}
                                        className={styles.profileImage}
                                    />
                                    <div className={styles.infoStack}>
                                        <span className={styles.nik}>{user.nikKtp}</span>
                                        <span className={styles.name}>{user.fullName}</span>
                                        <span className={styles.email}>{user.email}</span>
                                    </div>
                                </div>

                                {/* Bagian Tengah: Tautan KTP */}
                                <div className={styles.itemCenter}>
                                    {/* Link ini mengarah ke gambar KTP secara riil, target="_blank" akan membuka tab baru */}
                                    <a href={user.ktpImageUrl} target="_blank" rel="noopener noreferrer" className={styles.linkKTP}>
                                        Lihat KTP
                                    </a>
                                </div>

                                {/* Bagian Kanan: Aksi (Terima/Tolak) */}
                                <div className={styles.itemRight}>
                                    <button
                                        className={styles.rejectBtn}
                                        onClick={() => handleReview(user.email, false)}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        className={styles.acceptBtn}
                                        onClick={() => handleReview(user.email, true)}
                                    >
                                        Accept
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