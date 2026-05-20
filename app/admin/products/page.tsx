"use client";
import React from 'react';
import styles from '../admin.module.css';

export default function ManageProductsPage() {
    return (
        <>
            <h1 className={styles.headerTitle}>Manajemen Produk</h1>

            <p style={{ color: '#666', marginTop: '20px' }}>
                Gunakan halaman ini untuk memantau produk atau layanan jastip yang diposting oleh pengguna. Admin dapat menghapus (take down) produk yang terindikasi ilegal atau melanggar syarat dan ketentuan.
            </p>

            {/* Area Placeholder untuk Tabel/Grid Produk */}
            <div style={{
                marginTop: '40px',
                padding: '40px 20px',
                border: '2px dashed #ccc',
                borderRadius: '8px',
                textAlign: 'center',
                backgroundColor: '#fafafa'
            }}>
                <span style={{ fontSize: '32px' }}>📦</span>
                <h3 style={{ color: '#555', marginTop: '10px' }}>Fitur Daftar Produk Sedang Dalam Pengembangan</h3>
                <p style={{ color: '#888', fontSize: '14px' }}>Grid atau daftar produk dari backend akan ditampilkan di area ini.</p>
            </div>
        </>
    );
}