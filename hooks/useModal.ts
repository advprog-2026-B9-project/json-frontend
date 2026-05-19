import { useState } from 'react';

export interface ModalState {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'confirm';
    targetId?: string;
    redirectPath?: string;
}

export function useModal() {
    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const openModal = (config: Omit<ModalState, 'isOpen'>) => {
        setModal({ ...config, isOpen: true });
    };

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    return { modal, openModal, closeModal };
}