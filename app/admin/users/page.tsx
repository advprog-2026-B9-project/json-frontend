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

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("user");

            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);

                setAdminEmail(parsedUser.email || "");
            }
        }
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const url = statusFilter
                ? `${API_URL}/api/v1/auth/list?status=${statusFilter}`
                : `${API_URL}/api/v1/auth/list`;

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

    useEffect(() => {
        fetchUsers();
    }, [statusFilter]);

    const handleBanUser = async (email: string) => {
        if (!window.confirm(`Apakah Anda yakin ingin mem-banned user ${email}?`)) return;

        try {
            const response = await fetch(`${API_URL}/api/v1/auth/admin/ban?requesterEmail=${adminEmail}&email=${email}`, {
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
            const response = await fetch(`${API_URL}/api/v1/auth/admin/demote?requesterEmail=${adminEmail}&email=${email}`, {
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
                <div className={styles.listContainer}>
                    {filteredUsers.map((user) => (
                        <div key={user.id} className={styles.listItem}>

                            <div className={styles.itemLeft}>
                                <img
                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName || user.email}&backgroundColor=8F39DF`}
                                    alt={`Foto profil ${user.fullName}`}
                                    className={styles.profileImage}
                                />

                                <div className={styles.infoStack}>
                    <span className={styles.name}>
                        {user.fullName}
                    </span>

                                    <span className={styles.email}>
                        {user.email}
                    </span>

                                    <span className={styles.nik}>
                        {user.role} • {user.kycStatus}
                    </span>
                                </div>
                            </div>

                            <div className={styles.itemCenter}>
                <span
                    style={{
                        color: user.banned ? '#dc2626' : '#16a34a',
                        fontWeight: 'bold'
                    }}
                >
                    {user.banned ? 'BANNED' : 'ACTIVE'}
                </span>
                            </div>

                            <div className={styles.itemRight}>
                                {!user.banned && (
                                    <button
                                        className={styles.rejectBtn}
                                        onClick={() => handleBanUser(user.email)}
                                    >
                                        Ban
                                    </button>
                                )}

                                {user.role === 'JASTIPER' && (
                                    <button
                                        className={styles.acceptBtn}
                                        onClick={() => handleDemoteUser(user.email)}
                                    >
                                        Demote
                                    </button>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </>
    );
}