'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './profile.module.css';

interface UserData {
    id?: string;
    userId?: string;
    email?: string;
    role?: string;
    fullName?: string;
    username?: string;
    phoneNumber?: string;
    address?: string;
    kycStatus?: string;
    token?: string;
    accessToken?: string;
    jwt?: string;
    authToken?: string;
    photoUrl?: string;
}

export default function ProfilePage() {
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [toast, setToast] = useState({ message: '', isError: false });

    const [email, setEmail] = useState('');
    const [role, setRole] = useState('TITIPERS');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('UNVERIFIED');

    const [isKycModalOpen, setIsKycModalOpen] = useState(false);
    const [ktpFullName, setKtpFullName] = useState('');
    const [ktpNIK, setKtpNIK] = useState('');
    const [ktpImageUrl, setKtpImageUrl] = useState('');

    const [photoUrl, setPhotoUrl] = useState('');
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

    const loadUserData = () => {
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
            setIsAuthenticated(true);
            const parsedUser: UserData = JSON.parse(storedUser);

            setEmail(parsedUser.email || '');
            setRole(parsedUser.role || 'TITIPERS');
            setFullName(parsedUser.fullName || '');
            setPhoneNumber(parsedUser.phoneNumber || '');
            setAddress(parsedUser.address || '');
            setVerificationStatus(parsedUser.kycStatus || 'UNVERIFIED');

            if (!parsedUser.username && parsedUser.email) {
                setUsername(parsedUser.email.split('@')[0]);
            }
            else {
                setUsername(parsedUser.username || '');
            }
        }
        else {
            setIsAuthenticated(true);
            setFullName('John Doe');
            setUsername('John');
            setEmail('example@gmail.com');
            setRole('TITIPERS');
            setPhoneNumber('+62 123456789');
            setAddress('Jl. Anugerah Cinta No. 67 Rt. 6 Rw. 7 Sudirman, Jakarta Tenggara');
            setVerificationStatus('UNVERIFIED');
        }
    };

    const showNotification = (message: string, isError: boolean) => {
        setToast({ message, isError });
        setTimeout(() => { setToast({ message: '', isError: false }); }, 3000);
    };

    useEffect(() => {
        loadUserData();

        const fetchLatestData = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) return;

            const parsedUser = JSON.parse(storedUser) as UserData;
            if (!parsedUser.email) return;

            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
                const response = await fetch(`${API_URL}/api/v1/auth/user?email=${encodeURIComponent(parsedUser.email)}`);

                if (response.ok) {
                    const latestData = await response.json();

                    // Amankan id, userId, dan token bawaan agar tidak tertimpa data kosong
                    const mergedData = {
                        ...parsedUser,
                        ...latestData,
                        id: parsedUser.id || latestData.id,
                        userId: parsedUser.userId || latestData.userId,
                        token: parsedUser.token || latestData.token,
                        accessToken: parsedUser.accessToken || latestData.accessToken,
                        jwt: parsedUser.jwt || latestData.jwt,
                        authToken: parsedUser.authToken || latestData.authToken
                    };

                    localStorage.setItem('user', JSON.stringify(mergedData));

                    setVerificationStatus(latestData.kycStatus || 'UNVERIFIED');
                    setRole(latestData.role || 'TITIPERS');
                    setFullName(latestData.fullName || '');
                    setPhoneNumber(latestData.phoneNumber || '');
                    setAddress(latestData.address || '');
                    setPhotoUrl(parsedUser.photoUrl || '');
                    setUsername(latestData.username || latestData.email.split('@')[0]);
                }
            } catch (error) {
                console.error("Gagal sinkronisasi data dari server:", error);
            }
        };

        fetchLatestData();
    }, []);

    const renderBadge = () => {
        if (role === 'ADMIN') {
            return null;
        }

        switch (verificationStatus) {
            case 'VERIFIED':
                return <span className={`${styles.badge} ${styles.badgeVerified}`}>Verified</span>;
            case 'PENDING_VERIFICATION':
                return <span className={`${styles.badge} ${styles.badgePending}`}>Pending</span>;
            case 'UNVERIFIED':
            default:
                return <span className={`${styles.badge} ${styles.badgeUnverified}`}>Unverified</span>;
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setToast({ message: '', isError: false });
        loadUserData();
    };

    const handleSaveProfile = async () => {
        setIsLoading(true);
        setToast({ message: '', isError: false });

        const storedUser = localStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : {};

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            const response = await fetch(`${API_URL}/api/v1/auth/profile?email=${encodeURIComponent(email)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, username, phoneNumber, address }),
            });

            if (response.ok) {
                const updatedData = await response.json();

                const mergedData = {
                    ...parsedUser,
                    ...updatedData,
                    photoUrl,
                    id: parsedUser.id || updatedData.id,
                    userId: parsedUser.userId || updatedData.userId
                };

                localStorage.setItem('user', JSON.stringify(mergedData));
                showNotification('Profil berhasil diperbarui!', false);
                setIsEditing(false);
            }
            else {
                const errorText = await response.text();
                showNotification(errorText || 'Gagal memperbarui profil.', true);
            }
        }
        catch (error) {
            console.error('Terjadi kesalahan:', error);
            showNotification('Koneksi terputus. Server tidak merespon.', true);
        }
        finally {
            setIsLoading(false);
        }
    };

    const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d{0,16}$/.test(value)) {
            setKtpNIK(value);
        }
    };

    const handleOpenKycModal = () => {
        setKtpFullName(fullName);
        setIsKycModalOpen(true);
    };

    const handleCloseKycModal = () => {
        setIsKycModalOpen(false);
        setKtpFullName('');
        setKtpNIK('');
        setKtpImageUrl('');
    };

    const handleKycSubmit = async () => {
        if (!ktpFullName.trim()) {
            showNotification('Nama lengkap sesuai KTP wajib diisi!', true);
            return;
        }

        if (ktpNIK.length !== 16) {
            showNotification('NIK harus terdiri dari tepat 16 digit angka!', true);
            return;
        }

        if (!ktpImageUrl.trim()) {
            showNotification('Link Foto KTP wajib diisi!', true);
            return;
        }

        const savedUserString = localStorage.getItem('user');
        if (!savedUserString) {
            showNotification('Sesi tidak ditemukan. Silakan login ulang.', true);
            return;
        }

        const loggedInUser = JSON.parse(savedUserString);
        const userEmail = loggedInUser.email;

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            const response = await fetch(`${API_URL}/api/v1/auth/kyc/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    fullName: ktpFullName,
                    nikKtp: ktpNIK,
                    ktpImageUrl: ktpImageUrl
                }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                
                // Amankan id dan data penting bawaan saat memperbarui data KYC status
                const mergedData = {
                    ...loggedInUser,
                    ...updatedUser,
                    id: loggedInUser.id || updatedUser.id,
                    userId: loggedInUser.userId || updatedUser.userId
                };

                localStorage.setItem('user', JSON.stringify(mergedData));

                setVerificationStatus(updatedUser.kycStatus);
                showNotification('Pengajuan Jastiper berhasil dikirim!', false);
                handleCloseKycModal();
            } else {
                const errorText = await response.text();
                showNotification(errorText || 'Gagal mengirim pengajuan.', true);
            }
        } catch (error) {
            console.error("Error dari frontend:", error);
            showNotification('Gagal terhubung ke server.', true);
        }
    };

    if (!isAuthenticated && !toast.message) return null;
    return (
        <div className={styles.pageContainer}>

            {toast.message && (
                <div className={`${styles.toast} ${toast.isError ? styles.toastError : styles.toastSuccess}`}>
                    {toast.isError ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    )}
                    <span>{toast.message}</span>
                </div>
            )}

            <div className={styles.banner}></div>

            <div className={styles.card}>
                <div className={styles.avatarAbsoluteWrapper}>
                    <div className={styles.avatarContainer}>
                        <img
                            src={
                                photoUrl
                                    ? photoUrl
                                    : `https://api.dicebear.com/7.x/initials/svg?seed=${fullName || email}&backgroundColor=8F39DF`
                            }
                            alt="Avatar"
                            className={styles.avatarImage}
                        />
                    </div>
                    {isEditing && (
                        <>
                            <button
                                type="button"
                                className={styles.editAvatarIconContainer}
                                onClick={() => setIsPhotoModalOpen(true)}
                                title="Ubah Foto Profil"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                        </>
                    )}
                </div>

                <div className={styles.topHeader}>
                    <div>
                        {renderBadge()}
                    </div>

                    <div className={styles.headerAction}>
                        {isEditing ? (
                            <>
                                <button type="button" className={styles.cancelButton} onClick={handleCancelEdit} disabled={isLoading}>
                                    Cancel
                                </button>
                                <button type="button" className={styles.saveButton} onClick={handleSaveProfile} disabled={isLoading}>
                                    {isLoading ? 'Menyimpan...' : 'Save'}
                                </button>
                            </>
                        ) : (
                            <button type="button" className={styles.editButton} onClick={handleEditClick}>
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Full Name</label>
                            <input type="text" className={styles.inputField} value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!isEditing} />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Username</label>
                            <input type="text" className={styles.inputField} value={username} onChange={(e) => setUsername(e.target.value)} disabled={!isEditing} />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Phone Number</label>
                            <input type="text" className={styles.inputField} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={!isEditing} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Email Address</label>
                            <input type="email" className={styles.inputField} value={email} disabled style={{ cursor: isEditing ? 'not-allowed' : 'default' }} />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Role</label>
                            <input type="text" className={styles.inputField} value={role} disabled style={{ cursor: isEditing ? 'not-allowed' : 'default' }} />
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '20px', width: '100%' }}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Address</label>
                        <input type="text" className={styles.inputField} value={address} onChange={(e) => setAddress(e.target.value)} disabled={!isEditing} />
                    </div>
                </div>

                {role === 'TITIPERS' && verificationStatus === 'UNVERIFIED' && !isEditing && (
                    <div className={styles.upgradeContainer}>
                        <p className={styles.upgradeText}>
                            Ingin buka Jastip sendiri? <b>Upgrade akunmu jadi Jastiper sekarang!</b>
                        </p>
                        <button type="button" className={styles.upgradeButton} onClick={handleOpenKycModal}>
                            Upgrade
                        </button>
                    </div>
                )}

                <div style={{ marginTop: '50px', textAlign: 'center' }}>
                    <Link href="/login" onClick={() => localStorage.removeItem('user')} className={styles.logoutLink}>
                        Log Out
                    </Link>
                </div>
            </div>

            {isPhotoModalOpen && (
                <div
                    className={styles.backdrop}
                    onClick={() => setIsPhotoModalOpen(false)}
                >
                    <div
                        className={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className={styles.modalTitle}>
                            Edit Profile Picture
                        </h3>

                        <div
                            className={styles.inputGroup}
                            style={{ width: '100%' }}
                        >
                            <label className={styles.label}>
                                Image URL
                            </label>

                            <input
                                type="url"
                                className={styles.inputField}
                                value={photoUrl}
                                onChange={(e) => setPhotoUrl(e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>

                        <div className={styles.modalAction}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => setIsPhotoModalOpen(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className={styles.saveButton}
                                onClick={() => setIsPhotoModalOpen(false)}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}