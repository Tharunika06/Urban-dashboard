import { useState, useEffect, useCallback } from 'react';
import { fetchTransactions } from '../services/customerService';
import { 
  processTransactionsToCustomers, 
  filterTransactionsByMonth, 
  searchCustomers 
} from '../utils/customerUtils';
import { UI_MESSAGES } from '../utils/constants';

/**
 * Custom hook to manage customer data fetching and processing
 */
export const useCustomers = (selectedMonth, searchTerm) => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [uniqueCustomers, setUniqueCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data function (can be called externally for refresh)
  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      
      const data = await fetchTransactions();
      
      setAllTransactions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(UI_MESSAGES.FETCH_CUSTOMER_FAILED, err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Process and filter customers whenever dependencies change
  useEffect(() => {
    // Filter by month
    let transactionsToProcess = filterTransactionsByMonth(allTransactions, selectedMonth);

    // Process into unique customers
    const processed = processTransactionsToCustomers(transactionsToProcess);
    setUniqueCustomers(processed);

    // Apply search filter
    const filtered = searchCustomers(processed, searchTerm);
    setFilteredCustomers(filtered);
  }, [searchTerm, selectedMonth, allTransactions]);

  // Remove customer from local state after deletion
  const removeCustomer = useCallback((customerPhone) => {
    setAllTransactions((prev) => 
      prev.filter((tx) => tx.customerPhone !== customerPhone)
    );
  }, []);

  return {
    uniqueCustomers,
    filteredCustomers,
    isLoading,
    error,
    fetchData,
    removeCustomer,
  };
};