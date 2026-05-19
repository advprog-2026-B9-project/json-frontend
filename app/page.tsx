"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./home.module.css";

interface UserData {
    email?: string;
    role?: string;
    fullName?: string;
    username?: string;
}

export default function HomePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
        }
        else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUser(JSON.parse(storedUser) as UserData);
            setIsLoading(false);
        }
    }, [router]);

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <p>Memuat halaman...</p>
            </div>
        );
    }

    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className={styles.pageContainer}>
            <nav className={styles.navbar}>
                <div className={styles.logoWrapper}>
                    <div className={styles.logoScaled}>
                        <div className={`${styles.bgText} ${styles.letterJ}`}>J</div>
                        <div className={`${styles.bgText} ${styles.letterS}`}>S</div>
                        <div className={`${styles.bgText} ${styles.letterO}`}>O</div>
                        <div className={`${styles.bgText} ${styles.letterN}`}>N</div>
                    </div>
                </div>

                <div className={styles.searchWrapper}>
                    <div className={styles.searchBar}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search"
                            className={styles.searchInput}
                        />
                    </div>  
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {isAdmin && (
                        <Link href="/admin/kyc" className={styles.adminButton}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                            Admin Panel
                        </Link>
                    )}

                    <Link href="/profile" className={styles.userLink}>
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>{user?.fullName || user?.username}</div>

                            <div className={styles.userRole}>
                                {isAdmin ? 'Administrator' : (user?.role || 'Titipers')}
                            </div>
                        </div>

                        <div className={styles.avatarCircle}>
                            <img
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName || 'User'}&backgroundColor=000000`}
                                alt="Avatar"
                                className={styles.avatarImg}
                            />
                        </div>
                    </Link>
                </div>
            </nav>

            <main className={styles.main}>
                <div className={styles.banner}>
                    <h1 className={styles.bannerTitle}>
                        Siap-siap War Tiket & Barang<br />Limited!
                    </h1>
                    <p className={styles.bannerText}>
                        Gunakan voucher <strong>JSONWAR50</strong> untuk diskon ongkos<br />
                        jastip 50%. Kuota terbatas untuk 100 orang pertama!
                    </p>
                    <button type="button" className={styles.klaimButton}>
                        Klaim Voucher
                    </button>
                </div>
            </main>
        </div>
    );
}