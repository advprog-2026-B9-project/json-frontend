'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';

export default function RegisterCard() {
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleTogglePassword = () => setShowPassword(!showPassword);
    const handleToggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (password !== confirmPassword) {
            setErrorMessage('Password and Confirm Password do not match!');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password }),
            });

            if (response.ok) {
                alert('Registration successful! Please login to continue.');
                router.push('/login'); // Lempar user ke halaman login setelah sukses
            }
            else {
                const errorText = await response.text();
                setErrorMessage(errorText || 'Registration failed. Email might already be in use.');
            }
        }
        catch (error) {
            console.error('Terjadi kesalahan:', error);
            setErrorMessage('Unable to connect to the server.');
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            {/*== Main Card ==*/}
            <div className={styles.card}>

                {/*== Left Panel ==*/}
                <div className={styles.leftPanel}>
                    <div className={`${styles.oval} ${styles.ovalLargeShadow}`}></div>
                    <div className={`${styles.oval} ${styles.ovalLarge}`}></div>
                    <div className={`${styles.oval} ${styles.ovalSmallTop}`}></div>
                    <div className={`${styles.oval} ${styles.ovalSmallBottom}`}></div>
                </div>

                {/*== Right Panel ==*/}
                <div className={styles.rightPanel}>
                    <form className={styles.formContainer} onSubmit={handleRegister}>
                        <h1 className={styles.title}>Register</h1>

                        {/*== Error Message ==*/}
                        {errorMessage && (
                            <p style={{ color: '#ffb3b3', fontSize: '12px', textAlign: 'center', marginBottom: '10px' }}>
                                {errorMessage}
                            </p>
                        )}

                        {/*== Full Name ==*/}
                        <div className={styles.inputGroup}>
                            <svg className={styles.inputIcon} viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Full Name"
                                className={styles.inputField}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

                        {/*== Email ==*/}
                        <div className={styles.inputGroup}>
                            <svg className={styles.inputIcon} viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            <input
                                type="email"
                                placeholder="Email Address"
                                className={styles.inputField}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/*== Password ==*/}
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
                                minLength={6}
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

                        {/*== Confirm Password ==*/}
                        <div className={styles.inputGroup}>
                            <svg className={styles.inputIcon} viewBox="0 0 24 24">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                            </svg>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                className={styles.inputField}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            {showConfirmPassword ? (
                                <svg className={styles.eyeIcon} viewBox="0 0 24 24" onClick={handleToggleConfirmPassword}>
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                </svg>
                            ) : (
                                <svg className={styles.eyeIconHidden} viewBox="0 0 24 24" onClick={handleToggleConfirmPassword}>
                                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                                </svg>
                            )}
                        </div>

                        {/*== Submit Button ==*/}
                        <button type="submit" className={styles.registerButton} disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Register'}
                        </button>

                        {/*== Sign In ==*/}
                        <div className={styles.signIn}>
                            <span>Already have an account? </span>
                            <Link href="/login">Login here</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}