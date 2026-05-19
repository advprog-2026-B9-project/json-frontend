import React from 'react';
import styles from './shared.module.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onNext: () => void;
    onPrev: () => void;
    onGoTo: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onNext, onPrev, onGoTo }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className={styles.paginationContainer} style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button 
                className={styles.secondaryBtn} onClick={onPrev} disabled={currentPage === 1}
                style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
                Sebelumnya
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button 
                    key={num} onClick={() => onGoTo(num)}
                    className={currentPage === num ? styles.primaryBtn : styles.secondaryBtn}
                    style={{ width: '40px' }}
                >
                    {num}
                </button>
            ))}

            <button 
                className={styles.secondaryBtn} onClick={onNext} disabled={currentPage === totalPages}
                style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
                Selanjutnya
            </button>
        </div>
    );
}