import { useState } from 'react';

export function usePagination<T>(items: T[], itemsPerPage: number) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    const currentData = items.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const next = () => setCurrentPage(p => Math.min(p + 1, totalPages));
    const prev = () => setCurrentPage(p => Math.max(p - 1, 1));
    const goTo = (page: number) => setCurrentPage(page);

    return { currentPage, totalPages, currentData, next, prev, goTo };
}