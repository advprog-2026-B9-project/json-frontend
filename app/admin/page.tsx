"use client";
import React from 'react';
import styles from './admin.module.css';

export default function AdminDashboardPage() {
    return (
        <div>
            <h1 className={styles.headerTitle}>Selamat Datang di Dashboard Admin</h1>
            <p style={{ color: '#666', marginTop: '10px', marginBottom: '30px' }}>
                Gunakan menu navigasi di atas untuk mengelola verifikasi KYC, manajemen pengguna, atau memantau produk yang terdaftar.
            </p>

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
                        -
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
                        -
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
                        -
                    </p>
                </div>
            </div>
        </div>
    );
}