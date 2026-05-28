"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from '../profile.module.css';

interface PublicProfileData {
    username: string;
    fullName: string;
    email: string;
    role: string;
    kycStatus: string;
    banned: boolean;
    rating: number;
    totalReviews: number;
    totalSuccessfulTransactions: number;
}

export default function PublicProfilePage() {
    const params = useParams();
    const encodedEmail = params?.email as string;
    const email = encodedEmail ? decodeURIComponent(encodedEmail) : '';

    const [profile, setProfile] = useState<PublicProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    useEffect(() => {
        if (!email) return;

        const fetchPublicProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/v1/auth/user?email=${encodeURIComponent(email)}`);
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                } else {
                    const msg = await response.text();
                    setError(msg || 'Gagal memuat profil pengguna.');
                }
            } catch (err) {
                console.error(err);
                setError('Terjadi kesalahan koneksi ke server.');
            } finally {
                setLoading(false);
            }
        };

        fetchPublicProfile();
    }, [email, API_URL]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <p style={{ color: '#000000' }}>Sedang memuat data...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.card} style={{ minHeight: '50vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <p className={styles.centerTextError}>{error || 'User tidak ditemukan!'}</p>
                </div>
            </div>
        );
    }

    const renderBadge = () => {
        if (profile.role === 'ADMIN') return null;

        switch (profile.kycStatus) {
            case 'VERIFIED':
                return <span className={`${styles.badge} ${styles.badgeVerified}`}>Verified</span>;
            case 'PENDING_VERIFICATION':
                return <span className={`${styles.badge} ${styles.badgePending}`}>Pending</span>;
            case 'UNVERIFIED':
            default:
                return <span className={`${styles.badge} ${styles.badgeUnverified}`}>Unverified</span>;
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.banner}></div>

            <div className={styles.card}>
                <div className={styles.avatarAbsoluteWrapper}>
                    <div className={styles.avatarContainer}>
                        <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.fullName || profile.email}&backgroundColor=8F39DF`}
                            alt="Avatar"
                            className={styles.avatarImage}
                        />
                    </div>
                </div>

                <div className={styles.topHeader}>
                    <div>
                        {renderBadge()}
                    </div>
                    {profile.banned && (
                        <span className={styles.bannedBadge}>Banned</span>
                    )}
                </div>

                <div className={styles.profileInfoSummary}>
                    <h2 className={styles.publicName}>{profile.fullName}</h2>
                    <p className={styles.publicUsername}>@{profile.username}</p>
                    <span className={styles.roleLabel}>{profile.role}</span>
                </div>

                <hr className={styles.divider} />

                <div className={styles.gridContainer}>
                    <div className={styles.infoGroup}>
                        <label className={styles.label}>Email Address</label>
                        <p className={styles.valueText}>{profile.email}</p>
                    </div>

                    <div className={styles.infoGroup}>
                        <label className={styles.label}>Status Akun</label>
                        <p style={{ color: profile.banned ? 'red' : 'green', fontWeight: 'bold' }}>
                            {profile.banned ? 'Akun Dibekukan (Banned)' : 'Aktif'}
                        </p>
                    </div>
                </div>

                {/* Kondisional Khusus Jastiper */}
                {profile.role === 'JASTIPER' && (
                    <div className={styles.jastiperStatsContainer}>
                        <h3 className={styles.sectionTitle}>Statistik Jastiper</h3>
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Transaksi Sukses</span>
                                <span className={styles.statValue}>{profile.totalSuccessfulTransactions}</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Rating Jasa</span>
                                <span className={styles.statValue}>
                                    ⭐ {profile.rating > 0 ? profile.rating.toFixed(2) : '-'}
                                </span>
                                <span className={styles.statSubText}>({profile.totalReviews} ulasan)</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}