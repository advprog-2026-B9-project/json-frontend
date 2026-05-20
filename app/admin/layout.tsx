"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className={styles.pageContainer}>

            <Link href="/" className={styles.backButton}>
                <span style={{ fontSize: '18px' }}>←</span> Back to Home
            </Link>

            <div className={styles.banner}></div>

            <div className={styles.card}>
                <div className={styles.tabsContainer}>
                    <Link href="/admin/kyc" className={`${styles.tab} ${pathname === '/admin/kyc' ? styles.tabActive : styles.tabInactive}`}>
                        KYC Verification
                    </Link>
                    <Link href="/admin/users" className={`${styles.tab} ${pathname === '/admin/users' ? styles.tabActive : styles.tabInactive}`}>
                        Manage Users
                    </Link>
                    <Link href="/admin/products" className={`${styles.tab} ${pathname.match('/admin/products') ? styles.tabActive : styles.tabInactive}`}>
                        Manage Products
                    </Link>
                </div>

                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}