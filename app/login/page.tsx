'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';

export default function LoginCard() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const handleTogglePassword = () => setShowPassword(!showPassword);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            router.push('/');
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('Login sukses!', userData);

                localStorage.setItem('user', JSON.stringify(userData));
                setToastMessage(`Login berhasil! Selamat datang, ${userData.fullName || userData.username}.`);
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            }
            else {
                const errorText = await response.text();
                setErrorMessage(errorText || 'Email atau password salah!');
            }
        }
        catch (error) {
            console.error('Terjadi kesalahan:', error);
            setErrorMessage('Tidak dapat terhubung ke server.');
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.card}>

                <div className={styles.leftPanel}>
                    <div className={`${styles.bgText} ${styles.letterJ}`}>J</div>
                    <div className={`${styles.bgText} ${styles.letterS}`}>S</div>
                    <div className={`${styles.bgText} ${styles.letterO}`}>O</div>
                    <div className={`${styles.bgText} ${styles.letterN}`}>N</div>
                </div>

                <div className={styles.rightPanel}>
                    <form className={styles.formContainer} onSubmit={handleLogin}>
                        <h1 className={styles.title}>JSON</h1>

                        {errorMessage && (
                            <p style={{ color: '#ffb3b3', fontSize: '12px', textAlign: 'center', marginBottom: '10px' }}>
                                {errorMessage}
                            </p>
                        )}

                        <div className={styles.inputGroup}>
                            <svg className={styles.inputIcon} viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Email"
                                className={styles.inputField}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <svg className={styles.inputIcon} viewBox="0 0 24 24">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                            </svg>

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className={styles.inputField}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            {showPassword ? (
                                <svg className={styles.eyeIcon} viewBox="0 0 24 24" onClick={handleTogglePassword}>
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                </svg>
                            ) : (
                                <svg className={styles.eyeIconHidden} viewBox="0 0 24 24" onClick={handleTogglePassword}>
                                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                                </svg>
                            )}
                        </div>

                        {/*== Forgot Password ==*/}
                        <div className={styles.forgotPassword}>
                            {/*TODO: Tampilan Forgot Password*/}
                            <a href="#">Forgot Password</a>
                        </div>

                        <button type="submit" className={styles.loginButton} disabled={isLoading}>
                            {isLoading ? 'Logging In...' : 'Login'}
                        </button>

                        <div className={styles.signUp}>
                            <Link href="/register">Sign Up</Link>
                        </div>
                    </form>
                </div>
            </div>
            {toastMessage && (
                <div className={styles.toast}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    {toastMessage}
                </div>
            )}
        </div>
    );
}