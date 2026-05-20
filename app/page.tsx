"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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