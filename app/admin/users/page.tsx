"use client";
import React from 'react';
import styles from '../admin.module.css';

export default function ManageUsersPage() {
    return (
        <>
            <h1 className={styles.headerTitle}>Manajemen Pengguna</h1>

            <p style={{ color: '#666', marginTop: '20px' }}>
                Halaman ini nantinya akan menampilkan daftar seluruh pengguna yang terdaftar di sistem. Anda dapat melihat detail pengguna, membekukan akun (ban), atau mengatur hak akses di sini.
            </p>

            {/* Area Placeholder untuk Tabel Data */}
            <div style={{
                marginTop: '40px',
                padding: '40px 20px',
                border: '2px dashed #ccc',
                borderRadius: '8px',
                textAlign: 'center',
                backgroundColor: '#fafafa'
            }}>
                <span style={{ fontSize: '32px' }}>🚧</span>
                <h3 style={{ color: '#555', marginTop: '10px' }}>Fitur Tabel Pengguna Sedang Dalam Pengembangan</h3>
                <p style={{ color: '#888', fontSize: '14px' }}>Tabel data dari backend akan ditampilkan di area ini.</p>
            </div>
        </>
    );
}