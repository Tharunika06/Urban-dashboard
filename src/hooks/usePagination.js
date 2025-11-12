import { useState, useMemo, useCallback, useEffect } from 'react';

/**
 * Custom hook for pagination logic
 */
export const usePagination = (items, itemsPerPage) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  // Reset to page 1 when items change or when current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [items.length, totalPages, currentPage]);

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // Navigate to next page
  const nextPage = useCallback(() => {
    setCurrentPage(prev => {
      if (prev < totalPages) {
        return prev + 1;
      }
      return prev;
    });
  }, [totalPages]);

  // Navigate to previous page
  const prevPage = useCallback(() => {
    setCurrentPage(prev => {
      if (prev > 1) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  // Check if next page exists
  const hasNextPage = currentPage < totalPages;

  // Check if previous page exists
  const hasPrevPage = currentPage > 1;

  // Reset to page 1 - wrapped in useCallback to prevent unnecessary re-renders
  const resetPage = useCallback(() => setCurrentPage(1), []);

  return {
    currentPage,
    totalPages,
    currentItems,
    handlePageChange,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    resetPage,
  };
};