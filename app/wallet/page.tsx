"use client";

import { useEffect, useMemo, useState } from "react";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import { getAuthSession, type AuthSession } from "@/lib/auth-session";
import styles from "./wallet.module.css";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

type WalletSummary = {
    balance: number;
    status: "verified";
};

const walletSummaryMock: WalletSummary = {
    balance: 4_500_000,
    status: "verified",
};

const formatRupiah = (value: number): string => {
    return `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value)}`;
};

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" className={styles.searchIcon} aria-hidden="true">
        <path
            d="M10.5 3.5a7 7 0 0 1 5.58 11.23l4.1 4.09a1 1 0 1 1-1.42 1.42l-4.1-4.09A7 7 0 1 1 10.5 3.5Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
            fill="currentColor"
        />
    </svg>
);

const WalletIcon = () => (
    <svg viewBox="0 0 24 24" className={styles.walletIcon} aria-hidden="true">
        <path
            d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75V8h-1.5V6.75c0-.69-.56-1.25-1.25-1.25H6.75c-.69 0-1.25.56-1.25 1.25V8H4V6.75Zm0 3.25h16c.55 0 1 .45 1 1v6.75A2.25 2.25 0 0 1 18.75 20h-13.5A2.25 2.25 0 0 1 3 17.75V11c0-.55.45-1 1-1Zm11.75 3.25a1.25 1.25 0 1 0 0 2.5h2a1.25 1.25 0 1 0 0-2.5h-2Z"
            fill="currentColor"
        />
    </svg>
);

const TopUpIcon = () => (
    <svg viewBox="0 0 24 24" className={styles.actionIcon} aria-hidden="true">
        <path d="M12 4a1 1 0 0 1 1 1v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.42L11 13.6V5a1 1 0 0 1 1-1Z" fill="currentColor" />
    </svg>
);

const WithdrawIcon = () => (
    <svg viewBox="0 0 24 24" className={styles.actionIcon} aria-hidden="true">
        <path d="M12 20a1 1 0 0 1-1-1v-8.59l-2.3 2.3a1 1 0 1 1-1.4-1.42l4-4a1 1 0 0 1 1.4 0l4 4a1 1 0 1 1-1.4 1.42L13 10.4V19a1 1 0 0 1-1 1Z" fill="currentColor" />
    </svg>
);

export default function WalletPage() {
    const router = useRouter();
    const [session, setSession] = useState<AuthSession | null>(null);

    useEffect(() => {
        const currentSession = getAuthSession();
        if (!currentSession) {
            router.replace("/");
            return;
        }

        setSession(currentSession);
    }, [router]);

    const profileName = useMemo(() => session?.fullName || "Titipers", [session?.fullName]);

    return (
        <main className={`${styles.page} ${poppins.className}`}>
            <section className={styles.heroArea}>
                <div className={styles.heroContent}>
                    <div className={styles.brand}>JSON</div>

                    <div className={styles.searchWrapper}>
                        <SearchIcon />
                        <input className={styles.searchInput} placeholder="Search" aria-label="Cari transaksi" />
                    </div>

                    <div className={styles.profileArea}>
                        <div>
                            <div className={styles.profileLabel}>Nama</div>
                            <div className={styles.profileName}>{profileName}</div>
                        </div>
                        <div className={styles.profileAvatar} aria-hidden="true" />
                    </div>
                </div>
            </section>

            <section className={styles.walletCard}>
                <div>
                    <div className={styles.walletMeta}>
                        <WalletIcon />
                        <span>Total Saldo Wallet</span>
                    </div>
                    <h1 className={styles.walletAmount}>{formatRupiah(walletSummaryMock.balance)}</h1>
                    <span className={styles.verifiedBadge}>
                        {walletSummaryMock.status === "verified" ? "Verified Account" : "Unverified"}
                    </span>
                </div>

                <div className={styles.actionGroup}>
                    <button type="button" className={styles.topUpButton}>
                        <TopUpIcon />
                        Top Up
                    </button>
                    <button type="button" className={styles.withdrawButton}>
                        <WithdrawIcon />
                        Withdraw
                    </button>
                </div>
            </section>

            <section className={styles.transactionSection}>
                <div className={styles.transactionHeader}>
                    <h2>Riwayat Transaksi</h2>
                    <button type="button" className={styles.seeAllButton}>
                        Lihat Semua
                    </button>
                </div>
            </section>
        </main>
    );
}