// src/services/customerService.js
import api from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Fetch all transactions from API
 * ✅ Updated to use axios instance
 */
export const fetchTransactions = async () => {

  const response = await api.get(API_ENDPOINTS.TRANSACTIONS);
  return response.data;
};

/**
 * Delete a customer by phone number
 * ✅ Updated to use axios instance
 */
export const deleteCustomer = async (customerPhone) => {

  
  const response = await api.delete(
    `${API_ENDPOINTS.CUSTOMER}/${encodeURIComponent(customerPhone)}`
  );

  const data = response.data;

  if (!data.success) {
    throw new Error(data.message || 'Failed to delete customer');
  }

  return data;
};

/**
 * Fetch customer data by phone number
 * ✅ Updated to use axios instance
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

/**
 * Get all customers (aggregated from transactions)
 * ✅ New function for customer listing
 */
export const getAllCustomers = async () => {

  
  const allTransactions = await fetchTransactions();

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
      proptype: [...new Set(txns.map((tx) => tx.property?.type).filter(Boolean))].join(', ') || 'Apartment',
      totalTransactions: txns.length,
      totalAmount: txns.reduce((sum, tx) => sum + (tx.amount || 0), 0),
    });
  }

  return customers;
};

/**
 * Create new customer
 * ✅ New function for adding customers
 */
export const createCustomer = async (customerData) => {

  const response = await api.post(API_ENDPOINTS.CUSTOMER, customerData);
  return response.data;
};

/**
 * Update customer
 * ✅ New function for updating customers
 */
export const updateCustomer = async (customerPhone, customerData) => {

  const response = await api.put(
    `${API_ENDPOINTS.CUSTOMER}/${encodeURIComponent(customerPhone)}`,
    customerData
  );
  return response.data;
};

/**
 * Get customer transactions
 * ✅ New function for getting specific customer transactions
 */
export const getCustomerTransactions = async (customerPhone) => {

  const allTransactions = await fetchTransactions();
  
  return allTransactions.filter(
    (tx) => String(tx.customerPhone) === String(customerPhone)
  );
};

/**
 * Search customers
 * ✅ New function for searching customers
 */
export const searchCustomers = async (query) => {

  
  const allCustomers = await getAllCustomers();
  const lowerQuery = query.toLowerCase();
  
  return allCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(lowerQuery) ||
      customer.email.toLowerCase().includes(lowerQuery) ||
      customer.phone.includes(query)
  );
};

/**
 * Default export - customerService object
 * ✅ For consistency with propertyService and ownerService
 */
const customerService = {
  getAllCustomers,
  getCustomerByPhone: fetchCustomerByPhone,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerTransactions,
  searchCustomers,
  fetchTransactions,
};

export default customerService;