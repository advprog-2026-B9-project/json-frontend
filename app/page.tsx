"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./home.module.css";
import Link from "next/link";

interface UserData {
    email?: string;
    role?: string;
    fullName?: string;
    username?: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    originCountry: string;
    averageRating: number;
}

export default function HomePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserData | null>(null);

    const [topProducts, setTopProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
        } else {
            setUser(JSON.parse(storedUser) as UserData);
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
                const response = await fetch(`${API_URL}/api/v1/products`);

                if (response.ok) {
                    const data: Product[] = await response.json();
                    const sortedProducts = data.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
                    setTopProducts(sortedProducts.slice(0, 2));
                }
            } catch (error) {
                console.error("Gagal mengambil data produk:", error);
            } finally {
                setIsLoadingProducts(false);
            }
        };

        fetchTopProducts();
    }, []);

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <p>Memuat halaman...</p>
            </div>
        );
    }

    const isTitiper = user?.role?.toUpperCase() === 'TITIPERS';

    return (
        <div className={styles.pageContainer}>
            <main className={styles.main}>
                {/* Hero Banner Section */}
                <div className={styles.heroBanner}>
                    <h1 className={styles.heroTitle}>
                        Titip Belanja Mudah, Cepat, dan Aman!
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Temukan barang impianmu dari seluruh dunia tanpa ribet. Biar para Jastiper kami yang urus semuanya untukmu.
                    </p>

                    <div className={styles.ctaGroup}>
                        <Link href="/products" className={styles.ctaPrimary}>
                            Mulai Belanja Sekarang
                        </Link>

                        {isTitiper && (
                            <Link href="/profile" className={styles.ctaSecondary}>
                                Daftar Jadi Jastiper
                            </Link>
                        )}
                    </div>
                </div>

                {/* Top Products Section */}
                <div className={styles.topProductsSection}>
                    <h2 className={styles.sectionTitle}>Sedang Tren & Populer</h2>
                    <p className={styles.sectionSubtitle}>Produk dengan rating tertinggi dari Titipers lain</p>

                    {isLoadingProducts ? (
                        <p className={styles.loadingText}>Memuat produk unggulan...</p>
                    ) : topProducts.length > 0 ? (
                        <div className={styles.productGrid}>
                            {topProducts.map((product) => (
                                <Link href={`/products/${product.id}`} key={product.id} className={styles.productCard}>
                                    <div className={styles.productHeader}>
                                        <span className={styles.productOrigin}>📍 {product.originCountry}</span>
                                        <span className={styles.productRating}>⭐ {product.averageRating.toFixed(1)}</span>
                                    </div>
                                    <h3 className={styles.productName}>{product.name}</h3>
                                    <p className={styles.productPrice}>
                                        Rp {product.price.toLocaleString('id-ID')}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.loadingText}>Belum ada produk yang tersedia.</p>
                    )}
                </div>
            </main>
        </div>
    );
}