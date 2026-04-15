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

type TransactionStatus = "success" | "pending" | "failed";
type TransactionType = "topup" | "payment" | "withdraw";

type TransactionItem = {
    id: string;
    title: string;
    dateLabel: string;
    amount: number;
    type: TransactionType;
    status: TransactionStatus;
};

const walletSummaryMock: WalletSummary = {
    balance: 4_500_000,
    status: "verified",
};

const transactionHistoryMock: TransactionItem[] = [
    {
        id: "tx-001",
        title: "Top Up Wallet via BCA",
        dateLabel: "15 April 2026, 14:30",
        amount: 5_000_000,
        type: "topup",
        status: "success",
    },
    {
        id: "tx-002",
        title: "Pembayaran Jastip - Sepatu Nike",
        dateLabel: "14 April 2026, 10:15",
        amount: -1_250_000,
        type: "payment",
        status: "success",
    },
    {
        id: "tx-003",
        title: "Tarik Dana ke Bank Mandiri",
        dateLabel: "10 April 2026, 09:00",
        amount: -500_000,
        type: "withdraw",
        status: "pending",
    },
    {
        id: "tx-004",
        title: "Top Up Wallet via GoPay",
        dateLabel: "08 April 2026, 16:45",
        amount: 250_000,
        type: "topup",
        status: "success",
    },
    {
        id: "tx-005",
        title: "Pembayaran Tagihan Listrik",
        dateLabel: "05 April 2026, 13:20",
        amount: -350_000,
        type: "payment",
        status: "success",
    },
    {
        id: "tx-006",
        title: "Top Up Wallet via OVO",
        dateLabel: "02 April 2026, 08:30",
        amount: 1_000_000,
        type: "topup",
        status: "success",
    },
    {
        id: "tx-007",
        title: "Pembayaran Jastip - Tas Coach",
        dateLabel: "28 Maret 2026, 19:45",
        amount: -2_100_000,
        type: "payment",
        status: "success",
    },
    {
        id: "tx-008",
        title: "Tarik Dana ke BNI",
        dateLabel: "25 Maret 2026, 11:15",
        amount: -1_000_000,
        type: "withdraw",
        status: "failed",
    },
];

const formatTimeNow = (): string => {
    const now = new Date();
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(now).replace(".", ":");
};

const formatRupiah = (value: number): string => {
    return `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value)}`;
};

const formatDeltaAmount = (value: number): string => {
    const sign = value >= 0 ? "+" : "-";
    return `${sign} ${formatRupiah(Math.abs(value))}`;
};

const statusLabel: Record<TransactionStatus, string> = {
    success: "Success",
    pending: "Pending",
    failed: "Failed",
};

const HistoryIcon = ({ type }: { type: TransactionType }) => {
    if (type === "topup") {
        return (
            <svg viewBox="0 0 24 24" className={styles.historyIcon} aria-hidden="true">
                <path d="M6.5 7.5a1 1 0 0 1 1 1v4.1l9.8-9.8a1 1 0 1 1 1.4 1.4l-9.8 9.8H13a1 1 0 1 1 0 2H5.5a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1Z" fill="currentColor" />
            </svg>
        );
    }

    if (type === "withdraw") {
        return (
            <svg viewBox="0 0 24 24" className={styles.historyIcon} aria-hidden="true">
                <path d="M4 8.5h16v1.5H4V8.5Zm2 3h12v7H6v-7Zm3 2v3h1.5v-3H9Zm4.5 0v3H15v-3h-1.5ZM7 7l5-3 5 3H7Z" fill="currentColor" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" className={styles.historyIcon} aria-hidden="true">
            <path d="M7 3h8l4 4v14H5V3h2Zm1.5 4.5h7v-1.5h-7v1.5Zm0 4h7V10h-7v1.5Zm0 4h5V14h-5v1.5Z" fill="currentColor" />
        </svg>
    );
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
    const [searchQuery, setSearchQuery] = useState("");
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [balance, setBalance] = useState(walletSummaryMock.balance);
    const [transactions, setTransactions] = useState(transactionHistoryMock);

    useEffect(() => {
        const currentSession = getAuthSession();
        if (!currentSession) {
            router.replace("/");
            return;
        }

        setSession(currentSession);
    }, [router]);

    const profileName = useMemo(() => session?.fullName || "Titipers", [session?.fullName]);
    const filteredTransactions = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const baseData = normalizedQuery.length === 0
            ? transactions
            : transactions.filter((item) => {
                return (
                    item.title.toLowerCase().includes(normalizedQuery) ||
                    item.dateLabel.toLowerCase().includes(normalizedQuery)
                );
            });

        if (showAllTransactions) {
            return baseData;
        }

        return baseData.slice(0, 5);
    }, [searchQuery, showAllTransactions, transactions]);

    const prependTransaction = (entry: Omit<TransactionItem, "id">) => {
        setTransactions((previous) => [
            {
                id: `tx-${previous.length + 1}-${Date.now()}`,
                ...entry,
            },
            ...previous,
        ]);
    };

    const handleTopUp = () => {
        const amount = 100_000;
        setBalance((previous) => previous + amount);
        prependTransaction({
            title: "Top Up Wallet via Mock Gateway",
            dateLabel: formatTimeNow(),
            amount,
            type: "topup",
            status: "success",
        });
    };

    const handleWithdraw = () => {
        const amount = 75_000;
        setBalance((previous) => previous - amount);
        prependTransaction({
            title: "Tarik Dana Mock ke Bank",
            dateLabel: formatTimeNow(),
            amount: -amount,
            type: "withdraw",
            status: "pending",
        });
    };

    return (
        <main className={`${styles.page} ${poppins.className}`}>
            <section className={styles.heroArea}>
                <div className={styles.heroContent}>
                    <div className={styles.brand}>JSON</div>

                    <div className={styles.searchWrapper}>
                        <SearchIcon />
                        <input
                            className={styles.searchInput}
                            placeholder="Search"
                            aria-label="Cari transaksi"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                        />
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
                    <h1 className={styles.walletAmount} aria-live="polite">{formatRupiah(balance)}</h1>
                    <span className={styles.verifiedBadge}>
                        {walletSummaryMock.status === "verified" ? "Verified Account" : "Unverified"}
                    </span>
                    <p className={styles.mockHint}>Mock mode aktif, belum terhubung backend.</p>
                </div>

                <div className={styles.actionGroup}>
                    <button type="button" className={styles.topUpButton} onClick={handleTopUp}>
                        <TopUpIcon />
                        Top Up
                    </button>
                    <button type="button" className={styles.withdrawButton} onClick={handleWithdraw}>
                        <WithdrawIcon />
                        Withdraw
                    </button>
                </div>
            </section>

            <section className={styles.transactionSection}>
                <div className={styles.transactionHeader}>
                    <h2>Riwayat Transaksi</h2>
                    <button
                        type="button"
                        className={styles.seeAllButton}
                        onClick={() => setShowAllTransactions((value) => !value)}
                    >
                        {showAllTransactions ? "Ringkas" : "Lihat Semua"}
                    </button>
                </div>

                <div className={styles.transactionCard} aria-live="polite">
                    {filteredTransactions.length === 0 ? (
                        <div className={styles.emptyState}>Transaksi tidak ditemukan.</div>
                    ) : filteredTransactions.map((transaction) => {
                        const amountClass = transaction.amount >= 0 ? styles.amountPlus : styles.amountMinus;
                        return (
                            <article key={transaction.id} className={styles.transactionRow}>
                                <div className={`${styles.iconCircle} ${styles[`icon_${transaction.type}`]}`}>
                                    <HistoryIcon type={transaction.type} />
                                </div>

                                <div className={styles.transactionInfo}>
                                    <h3>{transaction.title}</h3>
                                    <p>{transaction.dateLabel}</p>
                                </div>

                                <div className={styles.transactionMeta}>
                                    <div className={`${styles.transactionAmount} ${amountClass}`}>
                                        {formatDeltaAmount(transaction.amount)}
                                    </div>
                                    <span className={`${styles.statusBadge} ${styles[`status_${transaction.status}`]}`}>
                                        {statusLabel[transaction.status]}
                                    </span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}