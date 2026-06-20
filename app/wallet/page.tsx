"use client";

import { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import styles from "./wallet.module.css";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

type UserSession = {
    id?: string;
    userId?: string;
    fullName?: string;
    username?: string;
    role?: string;
    token?: string;
    accessToken?: string;
    jwt?: string;
    authToken?: string;
};

type TransactionStatus = "success" | "pending" | "failed";
type TransactionType = "topup" | "payment" | "withdraw" | "refund";
type WalletActionType = "topup" | "withdraw";

type TransactionItem = {
    id: string;
    title: string;
    dateLabel: string;
    amount: number;
    type: TransactionType;
    status: TransactionStatus;
};

type WalletApiResponse = {
    id: string;
    balance: number | string;
};

type TransactionApiResponse = {
    id: string;
    type?: string;
    status?: string;
    amount: number | string;
    description?: string;
    createdAt?: string;
    timestamp?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const buildAuthOptions = (): RequestInit => {
    const headers: Record<string, string> = {};
    try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
            const parsedUser = JSON.parse(rawUser) as UserSession;
            const token = parsedUser.token || parsedUser.accessToken || parsedUser.jwt || parsedUser.authToken;
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch {
        // Abaikan jika tidak valid
    }
    return { headers, credentials: "include" };
};

const readErrorBody = async (response: Response): Promise<string> => {
    const bodyText = await response.text();
    if (!bodyText) return "";
    try {
        const parsed = JSON.parse(bodyText) as { message?: string; error?: string; detail?: string; };
        return parsed.message || parsed.error || parsed.detail || bodyText;
    } catch {
        return bodyText;
    }
};

const mapStatusToHint = (status: number): string => {
    if (status === 400) return "Request tidak valid. Cek parameter.";
    if (status === 401) return "Belum login atau token expired.";
    if (status === 403) return "Akses ditolak. Validasi role/token backend gagal.";
    if (status === 404) return "Endpoint tidak ditemukan.";
    if (status >= 500) return "Terjadi error internal backend.";
    return "Request gagal diproses.";
};

const getResponseError = async (response: Response, endpoint: string, fallback: string): Promise<string> => {
    const errorText = await readErrorBody(response);
    const statusHint = mapStatusToHint(response.status);
    return `[${endpoint}] HTTP ${response.status}. ${statusHint}${errorText ? ` Detail: ${errorText}` : ` ${fallback}`}`;
};

const assertOk = async (response: Response, endpoint: string, fallback: string): Promise<void> => {
    if (!response.ok) {
        throw new Error(await getResponseError(response, endpoint, fallback));
    }
};

const formatDateTime = (value?: string): string => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date).replace(".", ":");
};

const toNumber = (value: number | string | undefined): number => {
    if (typeof value === "number") return value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const mapBackendTransactionType = (type?: string): TransactionType => {
    const normalized = (type || "").toUpperCase();
    if (normalized.includes("TOP_UP") || normalized.includes("TOPUP")) return "topup";
    if (normalized.includes("WITHDRAW")) return "withdraw";
    if (normalized.includes("REFUND")) return "refund";
    return "payment";
};

const mapBackendStatus = (status?: string): TransactionStatus => {
    const normalized = (status || "").toUpperCase();
    if (normalized === "SUCCESS") return "success";
    if (normalized === "FAILED") return "failed";
    return "pending";
};

const mapTransactionToUi = (transaction: TransactionApiResponse): TransactionItem => {
    const transactionType = mapBackendTransactionType(transaction.type);
    const amount = toNumber(transaction.amount);
    const signedAmount = transactionType === "topup" || transactionType === "refund"
        ? Math.abs(amount)
        : -Math.abs(amount);

    return {
        id: transaction.id,
        title: transaction.description || `Transaksi ${transactionType.toUpperCase()}`,
        dateLabel: formatDateTime(transaction.timestamp || transaction.createdAt),
        amount: signedAmount,
        type: transactionType,
        status: mapBackendStatus(transaction.status),
    };
};

const sortByNewest = (items: TransactionApiResponse[]): TransactionApiResponse[] => {
    return [...items].sort((a, b) => {
        const left = new Date(a.timestamp || a.createdAt || 0).getTime();
        const right = new Date(b.timestamp || b.createdAt || 0).getTime();
        return right - left;
    });
};

const formatRupiah = (value: number): string => {
    return `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value)}`;
};

const formatDeltaAmount = (value: number): string => {
    const sign = value > 0 ? "+" : value < 0 ? "-" : "";
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

const WalletIcon = () => (
    <svg viewBox="0 0 24 24" className={styles.walletIcon} aria-hidden="true">
        <path d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75V8h-1.5V6.75c0-.69-.56-1.25-1.25-1.25H6.75c-.69 0-1.25.56-1.25 1.25V8H4V6.75Zm0 3.25h16c.55 0 1 .45 1 1v6.75A2.25 2.25 0 0 1 18.75 20h-13.5A2.25 2.25 0 0 1 3 17.75V11c0-.55.45-1 1-1Zm11.75 3.25a1.25 1.25 0 1 0 0 2.5h2a1.25 1.25 0 1 0 0-2.5h-2Z" fill="currentColor" />
    </svg>
);

const TopUpIcon = () => (
    <svg viewBox="0 0 24 24" className={styles.actionIcon} aria-hidden="true">
        <path d="M12 20a1 1 0 0 1-1-1v-8.59l-2.3 2.3a1 1 0 1 1-1.4-1.42l4-4a1 1 0 0 1 1.4 0l4 4a1 1 0 1 1-1.4 1.42L13 10.4V19a1 1 0 0 1-1 1Z" fill="currentColor" />
    </svg>
);

const WithdrawIcon = () => (
    <svg viewBox="0 0 24 24" className={styles.actionIcon} aria-hidden="true">
        <path d="M12 4a1 1 0 0 1 1 1v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.42L11 13.6V5a1 1 0 0 1 1-1Z" fill="currentColor" />
    </svg>
);

export default function WalletPage() {
    const router = useRouter();
    const [session, setSession] = useState<UserSession | null>(null);
    const [walletId, setWalletId] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [balance, setBalance] = useState(0);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeAction, setActiveAction] = useState<WalletActionType | null>(null);
    const [inputAmount, setInputAmount] = useState("");

    const fetchWalletAndTransactions = async (currentWalletId: string) => {
        const walletResponse = await fetch(`${API_URL}/api/v1/wallets/${currentWalletId}`, buildAuthOptions());
        await assertOk(walletResponse, `GET ${API_URL}/api/v1/wallets/${currentWalletId}`, "Gagal memperbarui data wallet.");
        const walletData = await walletResponse.json() as WalletApiResponse;
        setBalance(toNumber(walletData.balance));

        const transactionResponse = await fetch(`${API_URL}/api/v1/transactions/wallets/${currentWalletId}`, buildAuthOptions());
        await assertOk(transactionResponse, `GET ${API_URL}/api/v1/transactions/wallets/${currentWalletId}`, "Gagal memperbarui data transaksi.");
        const transactionData = await transactionResponse.json() as TransactionApiResponse[];
        setTransactions(sortByNewest(transactionData).map(mapTransactionToUi));
    };

    const decodeUserIdFromToken = (token?: string): string | null => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.id || payload.sub || null;
        } catch {
            return null;
        }
    };

    const loadWalletDataByUserId = async (userId: string) => {
        const walletResponse = await fetch(`${API_URL}/api/v1/wallets/users/${userId}`, buildAuthOptions());
        let effectiveWalletResponse = walletResponse;

        if (walletResponse.status === 404) {
            const createWalletResponse = await fetch(`${API_URL}/api/v1/wallets/users/${userId}`, {
                method: "POST",
                ...buildAuthOptions(),
            });
            await assertOk(createWalletResponse, `POST ${API_URL}/api/v1/wallets/users/${userId}`, "Gagal membuat wallet baru.");
            effectiveWalletResponse = createWalletResponse;
        }

        await assertOk(effectiveWalletResponse, `GET ${API_URL}/api/v1/wallets/users/${userId}`, "Gagal mengambil data wallet.");
        const walletData = await effectiveWalletResponse.json() as WalletApiResponse;
        setWalletId(walletData.id);
        await fetchWalletAndTransactions(walletData.id);
    };

    const settleTransaction = async (transactionId: string) => {
        const settleResponse = await fetch(`${API_URL}/api/v1/transactions/${transactionId}/success`, {
            method: "POST",
            ...buildAuthOptions(),
        });
        if (!settleResponse.ok) {
            try {
                await fetch(`${API_URL}/api/v1/transactions/${transactionId}/failed`, {
                    method: "POST", ...buildAuthOptions()
                });
            } catch {
                // Best effort
            }
            await assertOk(settleResponse, `POST ${API_URL}/api/v1/transactions/${transactionId}/success`, "Transaksi gagal diselesaikan.");
        }
    };

    useEffect(() => {
        let isMounted = true;
        const initializeWalletPage = async () => {
            setIsPageLoading(true);
            const storedUser = localStorage.getItem("user");
            
            if (!storedUser) {
                router.replace("/");
                return;
            }

            try {
                const parsedUser = JSON.parse(storedUser) as UserSession;
                const loggedInUserId = parsedUser.id || parsedUser.userId || decodeUserIdFromToken(parsedUser.token);
                if (!loggedInUserId) throw new Error("ID user tidak ditemukan.");

                if (!isMounted) return;
                setSession(parsedUser);
                await loadWalletDataByUserId(loggedInUserId);
                console.log("Wallet terhubung ke backend.");
            } catch (error) {
                console.error("Gagal memuat wallet:", error);
            } finally {
                if (isMounted) setIsPageLoading(false);
            }
        };

        void initializeWalletPage();
        return () => { isMounted = false; };
    }, [router]);

    const userRole = session?.role?.toUpperCase();

    const processWalletAction = async (action: WalletActionType, amount: number) => {
        if (!walletId) {
            console.error("Wallet belum tersedia.");
            return;
        }

        const endpoint = action === "topup" ? "topup" : "withdrawal";
        setIsSubmitting(true);

        try {
            const createResponse = await fetch(`${API_URL}/api/v1/transactions/${endpoint}?walletId=${walletId}&amount=${amount}`, {
                method: "POST", ...buildAuthOptions(),
            });
            await assertOk(createResponse, `POST ${API_URL}/api/v1/transactions/${endpoint}`, `${action} gagal diproses.`);

            const createdTransaction = await createResponse.json() as TransactionApiResponse;
            await settleTransaction(createdTransaction.id);
            await fetchWalletAndTransactions(walletId);

            console.log(`${action} berhasil diproses.`);
            setActiveAction(null);
            setInputAmount("");
        } catch (error) {
            console.error(`${action} error:`, error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmAction = async () => {
        if (!activeAction) return;
        const amount = Number(inputAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            console.warn("Input nominal tidak valid.");
            return;
        }

        if (activeAction === "withdraw" && amount > balance) return;

        await processWalletAction(activeAction, Math.floor(amount));
    };

    const parsedInputAmount = Number(inputAmount);
    const isInsufficientWithdrawBalance = activeAction === "withdraw" && Number.isFinite(parsedInputAmount) && parsedInputAmount > 0 && parsedInputAmount > balance;
    const visibleTransactions = showAllTransactions ? transactions : transactions.slice(0, 4);

    if (isPageLoading) {
        return (
            <main className={`${styles.page} ${poppins.className}`}>
                <section className={styles.walletCard}>
                    <p className={styles.mockHint}>Memuat data wallet...</p>
                </section>
            </main>
        );
    }

    return (
        <main className={`${styles.page} ${poppins.className}`}>
            <section className={styles.heroArea}>
                <div className={styles.heroContent}>
                    
                    <section className={styles.walletCard}>
                        <div>
                            <div className={styles.walletMeta}>
                                <WalletIcon />
                                <span>Total Saldo Wallet</span>
                            </div>
                            <h1 className={styles.walletAmount} aria-live="polite">{formatRupiah(balance)}</h1>
                        </div>

                        <div className={styles.actionGroup}>
                            <button type="button" className={styles.topUpButton} onClick={() => { setInputAmount(""); setActiveAction("topup"); }} disabled={isSubmitting || !walletId}>
                                <TopUpIcon />
                                Top Up
                            </button>
                            {userRole === 'JASTIPER' && (
                                <button type="button" className={styles.withdrawButton} onClick={() => { setInputAmount(""); setActiveAction("withdraw"); }} disabled={isSubmitting || !walletId}>
                                    <WithdrawIcon />
                                    Withdraw
                                </button>
                            )}
                        </div>
                    </section>

                </div>
            </section>

            <section className={styles.transactionSection}>
                <div className={styles.transactionHeader}>
                    <h2>Riwayat Transaksi</h2>
                    <button type="button" className={styles.seeAllButton} onClick={() => setShowAllTransactions(!showAllTransactions)}>
                        {showAllTransactions ? "Ringkas" : "Lihat Semua"}
                    </button>
                </div>

                <div className={styles.transactionCard}>
                    {visibleTransactions.length > 0 ? (
                        visibleTransactions.map((transaction) => (
                            <div key={transaction.id} className={styles.transactionRow}>
                                <div className={`${styles.iconCircle} ${styles[`icon_${transaction.type}`]}`}>
                                    <HistoryIcon type={transaction.type} />
                                </div>
                                <div className={styles.transactionInfo}>
                                    <h3>{transaction.title}</h3>
                                    <p>{transaction.dateLabel}</p>
                                </div>
                                <div className={styles.transactionMeta}>
                                    <div className={`${styles.transactionAmount} ${transaction.amount > 0 ? styles.amountPlus : styles.amountMinus}`}>
                                        {formatDeltaAmount(transaction.amount)}
                                    </div>
                                    <div className={`${styles.statusBadge} ${styles[`status_${transaction.status}`]}`}>
                                        {statusLabel[transaction.status]}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>Belum ada transaksi.</div>
                    )}
                </div>
            </section>

            {activeAction && (
                <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
                    <div className={styles.modalCard}>
                        <h3 className={styles.modalTitle}>
                            {activeAction === "topup" ? "Top Up Wallet" : "Withdraw Wallet"}
                        </h3>
                        <p className={styles.modalDescription}>
                            Masukkan nominal untuk {activeAction === "topup" ? "Top Up" : "Withdraw"}.
                        </p>

                        <label className={styles.inputLabel} htmlFor="walletAmountInput">Nominal (Rupiah)</label>
                        <input
                            id="walletAmountInput"
                            type="number"
                            min="1"
                            step="1"
                            inputMode="numeric"
                            className={styles.amountInput}
                            placeholder="Contoh: 50000"
                            value={inputAmount}
                            onChange={(event) => setInputAmount(event.target.value)}
                        />
                        {isInsufficientWithdrawBalance && (
                            <p className={styles.modalWarning}>Saldo tidak cukup!</p>
                        )}

                        <div className={styles.modalActionGroup}>
                            <button type="button" className={styles.cancelButton} onClick={() => setActiveAction(null)} disabled={isSubmitting}>
                                Batal
                            </button>
                            <button
                                type="button"
                                className={styles.confirmButton}
                                onClick={handleConfirmAction}
                                disabled={isSubmitting || isInsufficientWithdrawBalance || !inputAmount}
                            >
                                {isSubmitting ? "Processing..." : "Konfirmasi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}