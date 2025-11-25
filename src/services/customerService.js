// src/services/customerService.js
import api from '../utils/authUtil';
import { API_ENDPOINTS } from '../utils/apiConfig';

/**
 * Fetch all transactions from API
 */
export const fetchTransactions = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.TRANSACTIONS);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Delete a customer by phone number
 */
export const deleteCustomer = async (customerPhone) => {
  try {
    const response = await api.delete(
      `${API_ENDPOINTS.CUSTOMER}/${encodeURIComponent(customerPhone)}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete customer');
    }

    return response.data;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

/**
 * Normalize phone number for comparison
 */
const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.toString().replace(/\D/g, '');
};

/**
 * Check if two phone numbers match
 */
const phoneMatches = (phone1, phone2) => {
  if (!phone1 || !phone2) return false;
  
  const p1 = phone1.toString();
  const p2 = phone2.toString();
  const normalized1 = normalizePhone(p1);
  const normalized2 = normalizePhone(p2);
  
  return (
    p1 === p2 ||
    p1 === `+${p2}` ||
    p2 === `+${p1}` ||
    normalized1 === normalized2 ||
    normalized1.endsWith(normalized2) ||
    normalized2.endsWith(normalized1)
  );
};

/**
 * Fetch customer data by phone number with enhanced matching
 */
export const fetchCustomerByPhone = async (customerPhone) => {
  try {
    console.log('Fetching customer data for phone:', customerPhone);
    
    const allTransactions = await fetchTransactions();
    console.log('Total transactions received:', allTransactions.length);
    
    // Decode the phone number from URL
    const decodedPhone = decodeURIComponent(customerPhone);
    console.log('Decoded phone for matching:', decodedPhone);
    
    // Filter transactions for this customer with flexible matching
    const customerTxns = allTransactions.filter(tx => {
      if (!tx.customerPhone) return false;
      return phoneMatches(tx.customerPhone, decodedPhone);
    });
    
    console.log('Matching transactions found:', customerTxns.length);

    if (customerTxns.length === 0) {
      // Log available phones for debugging
      const uniquePhones = [...new Set(
        allTransactions.map(tx => tx.customerPhone)
      )].filter(Boolean);
      console.log('Available customer phones:', uniquePhones.slice(0, 10));
      
      return { customer: null, transactions: [] };
    }

    // Get the most recent transaction
    const latestTxn = customerTxns.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];

    // Extract unique property information
    const interestedProperties = [
      ...new Set(customerTxns.map(tx => tx.property?.name).filter(Boolean))
    ];
    const propertyTypes = [
      ...new Set(customerTxns.map(tx => tx.property?.type).filter(Boolean))
    ];

    // Build customer data object
    const customer = {
      name: latestTxn.customerName || 'N/A',
      phone: latestTxn.customerPhone || 'N/A',
      email: latestTxn.customerEmail || 'N/A',
      address: latestTxn.customerAddress || 'N/A',
      photo: latestTxn.customerPhoto || '/assets/placeholder.png',
      status: 'Available',
      lastContacted: latestTxn.createdAt,
      preferences: latestTxn.customerPreferences || 'No preferences specified',
      interestedProperties: interestedProperties,
      propertyTypes: propertyTypes,
      totalTransactions: customerTxns.length,
      totalAmount: customerTxns.reduce((sum, tx) => sum + (tx.amount || 0), 0),
    };

    console.log('Customer data built:', customer);
    
    return { customer, transactions: customerTxns };
  } catch (error) {
    console.error('Error fetching customer by phone:', error);
    throw error;
  }
};

/**
 * Get all customers (aggregated from transactions)
 */
export const getAllCustomers = async () => {
  try {
    console.log('Fetching all customers...');
    
    const allTransactions = await fetchTransactions();
    console.log('Total transactions for aggregation:', allTransactions.length);

    // Group transactions by customer phone
    const customerMap = new Map();

    allTransactions.forEach((tx) => {
      const phone = tx.customerPhone;
      if (!phone) return;

      if (!customerMap.has(phone)) {
        customerMap.set(phone, []);
      }
      customerMap.get(phone).push(tx);
    });

    console.log('Unique customers found:', customerMap.size);

    // Build customer objects
    const customers = [];
    for (const [phone, txns] of customerMap.entries()) {
      const latestTxn = txns.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];

      customers.push({
        name: latestTxn.customerName || 'N/A',
        phone: latestTxn.customerPhone || 'N/A',
        email: latestTxn.customerEmail || 'N/A',
        address: latestTxn.customerAddress || 'N/A',
        photo: latestTxn.customerPhoto || '/assets/placeholder.png',
        status: 'Active',
        lastContacted: latestTxn.createdAt,
        interestedProperties: [
          ...new Set(txns.map((tx) => tx.property?.name).filter(Boolean)),
        ].join(', '),
        propertyTypes: [
          ...new Set(txns.map((tx) => tx.property?.type).filter(Boolean)),
        ],
        proptype: [
          ...new Set(txns.map((tx) => tx.property?.type).filter(Boolean))
        ].join(', ') || 'Apartment',
        totalTransactions: txns.length,
        totalAmount: txns.reduce((sum, tx) => sum + (tx.amount || 0), 0),
      });
    }

    console.log('Customers processed:', customers.length);
    return customers;
  } catch (error) {
    console.error('Error getting all customers:', error);
    throw error;
  }
};

/**
 * Create new customer
 */
export const createCustomer = async (customerData) => {
  try {
    const response = await api.post(API_ENDPOINTS.CUSTOMER, customerData);
    return response.data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

/**
 * Update customer
 */
export const updateCustomer = async (customerPhone, customerData) => {
  try {
    const response = await api.put(
      `${API_ENDPOINTS.CUSTOMER}/${encodeURIComponent(customerPhone)}`,
      customerData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

/**
 * Get customer transactions
 */
export const getCustomerTransactions = async (customerPhone) => {
  try {
    const allTransactions = await fetchTransactions();
    
    return allTransactions.filter((tx) => 
      phoneMatches(tx.customerPhone, customerPhone)
    );
  } catch (error) {
    console.error('Error getting customer transactions:', error);
    throw error;
  }
};

/**
 * Search customers
 */
export const searchCustomers = async (query) => {
  try {
    const allCustomers = await getAllCustomers();
    const lowerQuery = query.toLowerCase();
    
    return allCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(lowerQuery) ||
        customer.email.toLowerCase().includes(lowerQuery) ||
        customer.phone.includes(query)
    );
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
};

/**
 * Calculate customer statistics
 */
export const getCustomerStats = (transactions) => {
  const totalListing = transactions.length;
  const propertySold = transactions.filter(tx => 
    tx.type === 'sale' || tx.property?.status === 'sold'
  ).length;
  const propertyRent = transactions.filter(tx => 
    tx.type === 'rent' || tx.property?.status === 'rented'
  ).length;

  return {
    totalListing,
    propertySold,
    propertyRent,
  };
};

/**
 * Generate customer reviews from transactions
 */
export const getCustomerReviews = (transactions, limit = 3) => {
  return transactions.slice(0, limit).map((tx) => ({
    name: tx.customerName || 'Anonymous',
    handle: `@${(tx.customerName || 'user').toLowerCase().replace(/\s+/g, '')}`,
    photo: tx.customerPhoto || '/assets/placeholder.png',
    stars: 5,
    body: `Transaction completed for ${tx.property?.name || 'property'} at $${tx.amount?.toLocaleString() || '0'}`,
    date: new Date(tx.createdAt).toLocaleDateString(),
  }));
};

/**
 * Default export - customerService object
 */
const customerService = {
  // Core CRUD operations
  getAllCustomers,
  getCustomerByPhone: fetchCustomerByPhone,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  
  // Transaction operations
  fetchTransactions,
  getCustomerTransactions,
  
  // Search and filter
  searchCustomers,
  
  // Helper functions
  getCustomerStats,
  getCustomerReviews,
};

export default customerService;