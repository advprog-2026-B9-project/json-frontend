'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './profile.module.css';

interface UserData {
    email?: string;
    role?: string;
    fullName?: string;
    username?: string;
    phoneNumber?: string;
    address?: string;
    verificationStatus?: string;
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

            if (!parsedUser.username && parsedUser.email) {
                setUsername(parsedUser.email.split('@')[0]);
            }
            else {
                setUsername(parsedUser.username || '');
            }
        }
        else {
            setIsAuthenticated(true);
            setFullName('Rafasya Muhammad Subhan');
            setUsername('rafasya');
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
    }, []);

    const renderBadge = () => {
        switch (verificationStatus) {
            case 'VERIFIED':
                return <span className={`${styles.badge} ${styles.badgeVerified}`}>Verified Jastiper</span>;
            case 'PENDING':
                return <span className={`${styles.badge} ${styles.badgePending}`}>Pending Verification</span>;
            case 'UNVERIFIED':
            default:
                return <span className={`${styles.badge} ${styles.badgeUnverified}`}>Unverified</span>;
        }
    };

    // == Profile Editing ==
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

        try {
            const response = await fetch(`http://localhost:8080/auth/profile?email=${encodeURIComponent(email)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, username, phoneNumber, address }),
            });

            if (response.ok) {
                const updatedData = await response.json();
                localStorage.setItem('user', JSON.stringify(updatedData));
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

    // == Handle Modal ==
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
    };

    const handleKycSubmit = () => {
        if (!ktpFullName.trim()) {
            showNotification('Nama lengkap sesuai KTP wajib diisi!', true);
            return;
        }

        if (ktpNIK.length !== 16) {
            showNotification('NIK harus terdiri dari tepat 16 digit angka!', true);
            return;
        }

        alert(`Pengajuan Jastiper dikirim untuk:\nNama Lengkap: ${ktpFullName}\nNIK: ${ktpNIK}`);
        handleCloseKycModal();
    };

    if (!isAuthenticated && !toast.message) return null;
    return (
        <div className={styles.pageContainer}>

            {/*== Toast Notification ==*/}
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

            {/* == Banner == */}
            <div className={styles.banner}></div>

            {/* == Main Card == */}
            <div className={styles.card}>
                <div className={styles.avatarAbsoluteWrapper}>
                    <div className={styles.avatarContainer}>
                        <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${fullName || email}&backgroundColor=8F39DF`}
                            alt="Avatar"
                            className={styles.avatarImage}
                        />
                    </div>
                    {isEditing && (
                        <button
                            type="button"
                            className={styles.editAvatarIconContainer}
                            onClick={() => alert('Ganti Foto Profil (Milestone 100%)')}
                            title="Ubah Foto Profil"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
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
                    {/* == Left Section == */}
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

                    {/*== Right Section ==*/}
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

                {/*== Address ==*/}
                <div style={{ marginTop: '20px', width: '100%' }}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Address</label>
                        <input type="text" className={styles.inputField} value={address} onChange={(e) => setAddress(e.target.value)} disabled={!isEditing} />
                    </div>
                </div>

                {/*== Upgrade ==*/}
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

                {/*== Logout ==*/}
                <div style={{ marginTop: '50px', textAlign: 'center' }}>
                    <Link href="/login" onClick={() => localStorage.removeItem('user')} className={styles.logoutLink}>
                        Log Out
                    </Link>
                </div>
            </div>

            {/*== Modal ==*/}
            {isKycModalOpen && (
                <div className={styles.backdrop} onClick={handleCloseKycModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Upgrade to Jastiper</h3>

                        <div className={styles.inputGroup} style={{ width: '100%' }}>
                            <label className={styles.label}>Nama Lengkap Sesuai KTP</label>
                            <input
                                type="text"
                                className={styles.inputField}
                                value={ktpFullName}
                                onChange={(e) => setKtpFullName(e.target.value)}
                                placeholder="Tuliskan nama lengkap sesuai kartu identitas..."
                            />
                        </div>

                        <div className={styles.inputGroup} style={{ width: '100%' }}>
                            <label className={styles.label}>Nomor Induk Kependudukan (NIK)</label>
                            <input
                                type="text"
                                className={styles.inputField}
                                value={ktpNIK}
                                onChange={handleNikChange}
                                maxLength={16}
                                placeholder="Masukkan 16 digit NIK"
                            />
                        </div>

                        <div className={styles.modalAction}>
                            <button type="button" className={styles.cancelButton} onClick={handleCloseKycModal}>
                                Cancel
                            </button>
                            <button type="button" className={styles.saveButton} onClick={handleKycSubmit}>
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}