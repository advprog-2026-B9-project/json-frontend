"use client";
import React, { useState, useEffect } from 'react';
import styles from './admin.module.css';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        pendingKyc: 0,
        totalUsers: 0,
        activeProducts: 0
    });
    const [loading, setLoading] = useState(true);
    const [adminEmail, setAdminEmail] = useState<string>("");

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedEmail = localStorage.getItem("userEmail") || "";
            setAdminEmail(storedEmail);
        }
    }, []);

    useEffect(() => {
        if (!adminEmail) return;

        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                const kycResponse = await fetch(`${API_URL}/auth/admin/kyc/pending?requesterEmail=${adminEmail}`);
                const kycData = kycResponse.ok ? await kycResponse.json() : [];

                const usersResponse = await fetch(`${API_URL}/auth/list`);
                const usersData = usersResponse.ok ? await usersResponse.json() : [];

                const productsResponse = await fetch(`${API_URL}/api/v1/products`);
                const productsData = productsResponse.ok ? await productsResponse.json() : [];

                setStats({
                    pendingKyc: kycData.length,
                    totalUsers: usersData.length,
                    activeProducts: productsData.length
                });

            } catch (error) {
                console.error("Gagal memuat statistik dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [adminEmail, API_URL]);

    return (
        <div>
            <h1 className={styles.headerTitle}>Selamat Datang di Dashboard Admin</h1>
            <p style={{ color: '#666', marginTop: '10px', marginBottom: '30px' }}>
                Gunakan menu navigasi di atas untuk mengelola verifikasi KYC, manajemen pengguna, atau memantau produk yang terdaftar.
            </p>

            {loading ? (
                <p style={{ color: '#666', fontSize: '14px' }}>Sedang menghitung statistik terbaru...</p>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px'
                }}>
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px',
                        border: '1px solid #eee'
                    }}>
                        <h3 style={{ fontSize: '14px', color: '#888', margin: 0 }}>Pending KYC</h3>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#8F39DF', margin: '10px 0 0 0' }}>
                            {stats.pendingKyc} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>orang</span>
                        </p>
                    </div>

                    <div style={{
                        padding: '20px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px',
                        border: '1px solid #eee'
                    }}>
                        <h3 style={{ fontSize: '14px', color: '#888', margin: 0 }}>Total Users</h3>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#8F39DF', margin: '10px 0 0 0' }}>
                            {stats.totalUsers} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>akun</span>
                        </p>
                    </div>

                    <div style={{
                        padding: '20px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px',
                        border: '1px solid #eee'
                    }}>
                        <h3 style={{ fontSize: '14px', color: '#888', margin: 0 }}>Active Products</h3>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#8F39DF', margin: '10px 0 0 0' }}>
                            {stats.activeProducts} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>item</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}