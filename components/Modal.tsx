import React from 'react';
import styles from './shared.module.css';

interface ModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'confirm';
    onClose: () => void;
    onConfirm?: () => void;
}

export default function Modal({ isOpen, title, message, type, onClose, onConfirm }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalCard}>
                <h2 className={styles.modalTitle}>{title}</h2>
                <p className={styles.modalMessage} style={{ textAlign: 'center', marginBottom: '24px' }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {type === 'confirm' ? (
                        <>
                            <button className={styles.secondaryBtn} onClick={onClose}>Batal</button>
                            <button className={styles.dangerBtn} onClick={onConfirm}>Ya, Lanjutkan</button>
                        </>
                    ) : (
                        <button className={styles.primaryBtn} onClick={onClose}>Mengerti</button>
                    )}
                </div>
            </div>
        </div>
    );
}