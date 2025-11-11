import { API_CONFIG, API_ENDPOINTS } from '../utils/constants';

/**
 * Fetch all transactions from API
 */
export const fetchTransactions = async () => {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.TRANSACTIONS}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  
  return response.json();
};

/**
 * Delete a customer by phone number
 */
export const deleteCustomer = async (customerPhone) => {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CUSTOMER}/${encodeURIComponent(customerPhone)}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete customer');
  }

  return data;
};

/**
 * Fetch customer data by phone number
 */
export const fetchCustomerByPhone = async (customerPhone) => {
  const allTransactions = await fetchTransactions();

  // Filter transactions for this customer (compare as strings)
  const customerTxns = allTransactions.filter(
    (tx) => String(tx.customerPhone) === String(customerPhone)
  );

  if (customerTxns.length === 0) {
    return { customer: null, transactions: [] };
  }

  // Get the most recent transaction
  const latestTxn = customerTxns.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )[0];

  // Build customer data
  const customer = {
    name: latestTxn.customerName || 'N/A',
    phone: latestTxn.customerPhone || 'N/A',
    email: latestTxn.customerEmail || 'N/A',
    address: latestTxn.customerAddress || 'N/A',
    photo: latestTxn.customerPhoto || '/assets/placeholder.png',
    status: 'Active',
    lastContacted: latestTxn.createdAt,
    interestedProperties: [
      ...new Set(customerTxns.map((tx) => tx.property?.name).filter(Boolean)),
    ],
    propertyTypes: [
      ...new Set(customerTxns.map((tx) => tx.property?.type).filter(Boolean)),
    ],
    totalTransactions: customerTxns.length,
    totalAmount: customerTxns.reduce((sum, tx) => sum + (tx.amount || 0), 0),
  };

  return { customer, transactions: customerTxns };
};