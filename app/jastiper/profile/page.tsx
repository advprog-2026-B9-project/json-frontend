"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface PublicProfile {
    username: string;
    fullName: string;
    email: string;
    role: string;
    kycStatus: string;
    isBanned: boolean;
    rating: number;
    totalReviews: number;
    totalSuccessfulTransactions: number;
}

function ProfileContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const emailParam = searchParams.get('email');

    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRating, setSelectedRating] = useState(5);
    const [submittingRating, setSubmittingRating] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const fetchPublicProfile = async () => {
        if (!emailParam) return;
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/auth/user?email=${emailParam}`);

            if (response.ok) {
                const data: PublicProfile = await response.json();
                setProfile(data);
            }
            else {
                const text = await response.text();
                setError(text || 'Gagal memuat profil Jastiper.');
            }
        }
        catch (err) {
            console.error(err);
            setError('Terjadi kesalahan koneksi ke server.');
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!emailParam) {
            setError('Parameter email tidak ditemukan.');
            setLoading(false);
            return;
        }
        fetchPublicProfile();
    }, [emailParam, API_URL]);

    const handleRatingSubmit = async () => {
        if (!emailParam) return;
        try {
            setSubmittingRating(true);
            const response = await fetch(`${API_URL}/api/v1/auth/rating?jastiperEmail=${encodeURIComponent(emailParam)}&ratingScore=${selectedRating}`, {
                method: 'POST'
            });

            if (response.ok) {
                alert('✅ Terima kasih! Ulasan rating berhasil dikirim.');
                setIsModalOpen(false);
                fetchPublicProfile();
            }
            else {
                const msg = await response.text();
                alert('Gagal mengirim rating: ' + msg);
            }
        }
        catch (err) {
            console.error(err);
            alert('Terjadi kesalahan koneksi saat mengirim rating.');
        }
        finally {
            setSubmittingRating(false);
        }
    };

    const renderStars = (ratingScore: number, clickable = false, onSelect?: (r: number) => void) => {
        const stars = [];
        const floor = Math.floor(ratingScore);
        for (let i = 1; i <= 5; i++) {
            const isFilled = i <= (clickable ? selectedRating : floor);
            stars.push(
                <span
                    key={i}
                    onClick={() => clickable && onSelect && onSelect(i)}
                    style={{
                        color: isFilled ? '#f1c40f' : '#ccc',
                        fontSize: clickable ? '32px' : '20px',
                        cursor: clickable ? 'pointer' : 'default',
                        marginRight: '4px',
                        transition: 'color 0.2s ease'
                    }}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '100px', color: '#666' }}>Memuat profil Jastiper...</div>;
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', marginTop: '100px', padding: '20px' }}>
                <p style={{ color: 'red', fontWeight: 'bold' }}>⚠️ {error}</p>
                <button
                    onClick={() => router.push('/')}
                    style={{ marginTop: '15px', padding: '8px 16px', backgroundColor: '#8F39DF', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                    Kembali ke Beranda
                </button>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '30px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'sans-serif', position: 'relative' }}>

            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Beri Ulasan Jastiper</h3>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Pilih jumlah bintang ulasan untuk pelayanan {profile.fullName}</p>

                        <div style={{ marginBottom: '25px' }}>
                            {renderStars(selectedRating, true, (rating) => setSelectedRating(rating))}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={submittingRating}
                                style={{ flex: 1, padding: '10px', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleRatingSubmit}
                                disabled={submittingRating}
                                style={{ flex: 1, padding: '10px', backgroundColor: '#8F39DF', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                {submittingRating ? 'Mengirim...' : 'Kirim'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.fullName || profile.username}&backgroundColor=8F39DF`}
                    alt="Avatar Jastiper"
                    style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '15px' }}
                />
                <h2 style={{ margin: '5px 0', color: '#333' }}>{profile.fullName}</h2>
                <p style={{ margin: '0', color: '#888', fontSize: '14px' }}>@{profile.username}</p>

                <span style={{ display: 'inline-block', marginTop: '10px', padding: '4px 12px', backgroundColor: '#f0e6ff', color: '#8F39DF', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                    {profile.role}
                </span>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', margin: '20px 0' }}>
                <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#666', fontWeight: 'normal', fontSize: '14px' }}>Rating Jastiper</h4>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#333' }}>{profile.rating || 0}</span>
                        <div style={{ display: 'flex' }}>{renderStars(profile.rating || 0)}</div>
                    </div>
                    <small style={{ color: '#999' }}>({profile.totalReviews || 0} ulasan)</small>
                </div>

                <div style={{ borderLeft: '1px solid #eee' }}></div>

                <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#666', fontWeight: 'normal', fontSize: '14px' }}>Transaksi Sukses</h4>
                    <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '22px', color: '#2ecc71' }}>
                        {profile.totalSuccessfulTransactions ?? 0}
                    </p>
                    <small style={{ color: '#999' }}>Pesanan Terpenuhi</small>
                </div>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

            <div style={{ color: '#555', fontSize: '15px', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Email:</strong>
                    <span>{profile.email || emailParam}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Status KYC Akun:</strong>
                    <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                        {profile.kycStatus === 'VERIFIED' ? 'Verified Jastiper ✅' : 'Unverified ❌'}
                    </span>
                </div>
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                <button
                    onClick={() => router.push(`/products?jastiper=${profile.username}`)}
                    style={{ flex: 1, padding: '12px', backgroundColor: '#8F39DF', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'center' }}
                >
                    Lihat Produk Jastiper
                </button>

                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ padding: '12px', backgroundColor: '#fff', color: '#8F39DF', border: '2px solid #8F39DF', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Beri Ulasan
                </button>
            </div>

        </div>
    );
}

export default function JastiperProfilePage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '100px' }}>Memuat halaman...</div>}>
            <ProfileContent />
        </Suspense>
    );
}