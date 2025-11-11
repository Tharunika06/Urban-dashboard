import { MONTHS_FULL, DEFAULTS, CUSTOMER_STATUS } from './constants';

/**
 * Process transactions into unique customers
 */
export const processTransactionsToCustomers = (transactions) => {
  const customerMap = new Map();

  transactions.forEach((tx) => {
    const existingCustomer = customerMap.get(tx.customerPhone);

    // Only update if this is a newer transaction
    if (!existingCustomer || new Date(tx.createdAt) > new Date(existingCustomer.lastContacted)) {
      customerMap.set(tx.customerPhone, {
        id: tx.customerPhone,
        name: tx.customerName || 'N/A',
        phone: tx.customerPhone || 'N/A',
        photo: tx.customerPhoto || DEFAULTS.PLACEHOLDER_IMAGE,
        email: tx.customerEmail || 'N/A',
        address: tx.customerAddress || 'N/A',
        interestedProperties: tx.property?.name || 'N/A',
        proptype: tx.property?.type || DEFAULTS.DEFAULT_PROPERTY_TYPE,
        lastContacted: tx.createdAt || null,
        status: CUSTOMER_STATUS.ACTIVE,
        stats: {
          viewProperty: tx.stats?.viewProperty || 0,
          ownProperty: tx.stats?.ownProperty || 0,
          investOnProperty: tx.stats?.investOnProperty || 0,
        },
      });
    }
  });

  return Array.from(customerMap.values());
};

/**
 * Filter transactions by selected month
 */
export const filterTransactionsByMonth = (transactions, selectedMonth) => {
  if (!selectedMonth) return transactions;

  const monthIndex = MONTHS_FULL.indexOf(selectedMonth);
  
  if (monthIndex === -1) return transactions;

  return transactions.filter((tx) => 
    new Date(tx.createdAt).getMonth() === monthIndex
  );
};

/**
 * Search customers by term (name, phone, email)
 */
export const searchCustomers = (customers, searchTerm) => {
  if (!searchTerm) return customers;

  const term = searchTerm.toLowerCase();

  return customers.filter((c) =>
    (c.name && c.name.toLowerCase().includes(term)) ||
    (c.phone && c.phone.toLowerCase().includes(term)) ||
    (c.email && c.email.toLowerCase().includes(term))
  );
};

/**
 * Get CSS class for customer status
 */
export const getStatusClass = (status) => {
  return status ? status.toLowerCase().replace(' ', '-') : '';
};

/**
 * Calculate customer property statistics
 */
export const calculateCustomerStats = (transactions) => {
  return {
    viewPropertyCount: transactions.filter((tx) => tx.stats?.viewProperty).length,
    ownPropertyCount: transactions.filter((tx) => tx.stats?.ownProperty).length,
    investPropertyCount: transactions.filter((tx) => tx.stats?.investOnProperty).length,
  };
};

/**
 * Calculate progress percentage for stats
 */
export const calculateStatProgress = (count, total) => {
  if (total === 0) return 0;
  return Math.min((count / total) * 100, 100);
};