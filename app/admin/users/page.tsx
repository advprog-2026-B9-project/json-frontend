"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from '../admin.module.css';

interface User {
    id: string;
    username: string;
    fullName: string;
    email: string;
    role: string;
    kycStatus: string;
    banned: boolean;
}

export default function ManageUsersPage() {
    const router = useRouter();
    const { isLoaded, isAuthenticated, user} = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [adminEmail, setAdminEmail] = useState<string>("");

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // Verifikasi admin
    useEffect(() => {
        if (isLoaded) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'ADMIN') {
                router.push('/');
            }
        }
    }, [isLoaded, isAuthenticated, user, router]);

    // 1. Ambil email admin dari localStorage saat komponen dimuat
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedEmail = localStorage.getItem("userEmail") || "";
            setAdminEmail(storedEmail);
        }
    }, []);

    // 2. Fungsi ambil data user
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const url = statusFilter
                ? `${API_URL}/auth/list?status=${statusFilter}`
                : `${API_URL}/auth/list`;

            const response = await fetch(url);
            if (response.ok) {
                const data: User[] = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Gagal mengambil data user:", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. Panggil fungsi saat pertama kali halaman dibuka ATAU saat filter diganti
    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const handleBanUser = async (email: string) => {
        if (!window.confirm(`Apakah Anda yakin ingin mem-banned user ${email}?`)) return;

        try {
            const response = await fetch(`${API_URL}/auth/admin/ban?requesterEmail=${adminEmail}&email=${email}`, {
                method: 'POST',
            });

            if (response.ok) {
                alert("✅ User berhasil di-banned!");
                fetchUsers();
            } else {
                const msg = await response.text();
                alert("Gagal mem-banned: " + msg);
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan koneksi saat melakukan ban.");
        }
    };

    const handleDemoteUser = async (email: string) => {
        if (!window.confirm(`Apakah Anda yakin ingin menurunkan ${email} menjadi TITIPERS?`)) return;

        try {
            const response = await fetch(`${API_URL}/auth/admin/demote?requesterEmail=${adminEmail}&email=${email}`, {
                method: 'POST',
            });

            if (response.ok) {
                alert("✅ User berhasil di-demote!");
                fetchUsers();
            } else {
                const msg = await response.text();
                alert("Gagal melakukan demote: " + msg);
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan koneksi saat melakukan demote.");
        }
    };

    const filteredUsers = users.filter((user) => user.role !== 'ADMIN');

    return (
        <>
            <h1 className={styles.headerTitle}>Manajemen Pengguna</h1>

            <div style={{ marginBottom: '20px', marginTop: '20px' }}>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filter Status: </label>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                    <option value="">Semua User</option>
                    <option value="active">User Aktif (Verified & Unverified)</option>
                    <option value="pending">Menunggu Verifikasi (Pending KYC)</option>
                    <option value="banned">Akun Dibekukan (Banned)</option>
                </select>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>Sedang memuat data...</p>
            ) : filteredUsers.length === 0 ? (
                <p style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>Tidak ada pengguna ditemukan.</p>
            ) : (
                <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                        <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
                            <th style={{ padding: '12px' }}>Nama Lengkap</th>
                            <th style={{ padding: '12px' }}>Email</th>
                            <th style={{ padding: '12px' }}>Role</th>
                            <th style={{ padding: '12px' }}>Status KYC</th>
                            <th style={{ padding: '12px' }}>Status Akun</th>
                            <th style={{ padding: '12px' }}>Aksi</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '12px' }}>{user.fullName}</td>
                                <td style={{ padding: '12px' }}>{user.email}</td>
                                <td style={{ padding: '12px', fontWeight: 'bold' }}>{user.role}</td>
                                <td style={{ padding: '12px' }}>{user.kycStatus}</td>
                                <td style={{ padding: '12px', color: user.banned ? 'red' : 'green' }}>
                                    {user.banned ? 'Banned' : 'Aktif'}
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {!user.banned && (
                                        <button
                                            onClick={() => handleBanUser(user.email)}
                                            style={{ backgroundColor: 'red', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}
                                        >
                                            Ban
                                        </button>
                                    )}
                                    {user.role === 'JASTIPER' && (
                                        <button
                                            onClick={() => handleDemoteUser(user.email)}
                                            style={{ backgroundColor: 'orange', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Demote
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}