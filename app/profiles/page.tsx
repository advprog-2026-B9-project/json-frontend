'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './profiles.module.css';

interface User {
    id: string;
    email: string;
    username: string;
    fullName: string;
    role: string;
    photoUrl?: string;
    kycStatus: string;
}

export default function ProfilesPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('ALL');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
                const response = await fetch(`${API_URL}/api/v1/auth/list`);
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                }
                    else {
                    console.error('Gagal mengambil data user');
                }
            }
            catch (error) {
                console.error('Terjadi kesalahan:', error);
            }
            finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filter untuk mengecualikan admin, lalu jalankan filter role dan sorting
    const processedUsers = users
        .filter((user) => user.role !== 'ADMIN')
        .filter((user) => roleFilter === 'ALL' || user.role === roleFilter)
        .sort((a, b) => {
            const nameA = a.fullName || a.username || '';
            const nameB = b.fullName || b.username || '';
            return nameA.localeCompare(nameB);
        });

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headerSection}>
                <h1 className={styles.title}>Daftar Pengguna</h1>
                <div className={styles.filterContainer}>
                    <label htmlFor="roleFilter" className={styles.filterLabel}>Filter by Role: </label>
                    <select
                        id="roleFilter"
                        className={styles.filterSelect}
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="ALL">Semua Role</option>
                        <option value="JASTIPER">Jastiper</option>
                        <option value="TITIPERS">Titipers</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className={styles.loading}>Memuat data...</div>
            ) : (
                <div className={styles.gridContainer}>
                    {processedUsers.length > 0 ? (
                        processedUsers.map((user) => (
                            /* Ubah div menjadi Link dan arahkan ke /profile/[email] */
                            <Link
                                href={`/profile/${encodeURIComponent(user.email)}`}
                                key={user.id}
                                className={styles.userCard}
                            >
                                <div className={styles.avatarContainer}>
                                    <img
                                        src={
                                            user.photoUrl
                                                ? user.photoUrl
                                                : `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName || user.username || 'User'}&backgroundColor=8F39DF`
                                        }
                                        alt={user.username}
                                        className={styles.avatarImage}
                                    />
                                </div>
                                <div className={styles.userInfo}>
                                    <h3 className={styles.userName}>{user.fullName || user.username}</h3>
                                    <p className={styles.userEmail}>{user.email}</p>
                                    <span className={`${styles.roleBadge} ${styles[`role${user.role}`]}`}>
                                        {user.role}
                                    </span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className={styles.noData}>Tidak ada pengguna yang ditemukan.</div>
                    )}
                </div>
            )}
        </div>
    );
}