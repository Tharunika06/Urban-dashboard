// src/pages/Customers/Customers.jsx
import React, { useState, useEffect } from 'react';
import CustomerList from './CustomerList';
import CustomerGrid from './CustomerGrid';
import MonthDropdown from '../../components/common/MonthDropdown';
import Header from '../../components/layout/Header';
import PopupMessage from '../../components/common/PopupMessage';
import '../../styles/Dashboard.css';
import '../../styles/Customers.css';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Customers = () => {
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');

  const [allTransactions, setAllTransactions] = useState([]);
  const [uniqueCustomers, setUniqueCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Popup state management (similar to Owners component)
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const response = await fetch('http://192.168.0.152:5000/api/payment/transactions');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setAllTransactions(data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch customer data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndProcessData();
  }, []);

  useEffect(() => {
    let transactionsToProcess = allTransactions;

    if (selectedMonth) {
      const monthIndex = months.indexOf(selectedMonth);
      if (monthIndex > -1) {
        transactionsToProcess = transactionsToProcess.filter(tx =>
          new Date(tx.createdAt).getMonth() === monthIndex
        );
      }
    }

    const customerMap = new Map();
    transactionsToProcess.forEach(tx => {
      customerMap.set(tx.customerPhone, {
        id: tx.customerPhone, // use phone as id
        name: tx.customerName || 'N/A',
        phone: tx.customerPhone || 'N/A',
        photo: tx.customerPhoto || '/assets/placeholder.png',
        email: tx.customerEmail || 'N/A',
        address: tx.customerAddress || 'N/A',
        interestedProperties: tx.property?.name || 'N/A',
        proptype: tx.property?.type || 'Apartment',
        lastContacted: tx.createdAt || null,
        status:'Active',
        stats: {
          viewProperty: tx.stats?.viewProperty || 0,
          ownProperty: tx.stats?.ownProperty || 0,
          investOnProperty: tx.stats?.investOnProperty || 0,
        },
      });
    });

    const uniqueCustomersFromData = Array.from(customerMap.values());
    setUniqueCustomers(uniqueCustomersFromData);

    let finalResults = uniqueCustomersFromData;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      finalResults = uniqueCustomersFromData.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term)
      );
    }
    setFilteredCustomers(finalResults);
  }, [searchTerm, selectedMonth, allTransactions]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  // Show confirmation popup (similar to Owners component)
  const handleConfirmDelete = (customerPhone) => {
    console.log('Customer selected for deletion:', customerPhone);
    setCustomerToDelete(customerPhone);
    setShowDeletePopup(true);
  };

  // Actual delete handler with popup confirmation
  const handleDelete = async () => {
    if (!customerToDelete) return;
    
    try {
      console.log('Attempting to delete customer with phone:', customerToDelete);
      console.log('Type of customerPhone:', typeof customerToDelete);
      
      // If you have an API endpoint for deleting customers, uncomment and modify this:
      // const response = await axios.delete(`http://192.168.0.152:5000/api/customers/${customerToDelete}`);
      // console.log('Delete response:', response);
      
      // For now, just filter from local state
      const updatedCustomers = uniqueCustomers.filter(c => c.phone !== customerToDelete);
      setUniqueCustomers(updatedCustomers);
      setFilteredCustomers(updatedCustomers.filter(c => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return c.name.toLowerCase().includes(term) || c.phone.toLowerCase().includes(term);
      }));
      
      setShowDeletePopup(false);
      setCustomerToDelete(null);
      console.log('Customer deleted successfully');
    } catch (err) {
      console.error('Failed to delete customer:', err);
      console.error('Error details:', err.response?.data);
      console.error('Status:', err.response?.status);
      
      // Close the popup even if deletion failed
      setShowDeletePopup(false);
      setCustomerToDelete(null);
      
      // Show user-friendly error message
      alert('Failed to delete customer. Please try again.');
    }
  };

  // Cancel delete popup
  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setCustomerToDelete(null);
  };

  const renderContent = () => {
    if (isLoading) return <div className="loading-state">Loading customers...</div>;
    if (error) return <div className="error-state">Error: {error}</div>;
    if (view === 'list') {
      return <CustomerList customers={filteredCustomers} onDelete={handleConfirmDelete} />;
    }
    return <CustomerGrid customers={filteredCustomers} />;
  };

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <Header title="Customers" />
        <main className="dashboard-body p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div className="search-bar w-100 w-md-50 d-flex align-items-center">
              <img src="/assets/search-icon.png" alt="search" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="d-flex align-items-center gap-2">
              <div className="view-toggle">
                <button
                  className={view === 'list' ? 'active' : ''}
                  onClick={() => setView('list')}
                >
                  <img src={view === 'list' ? '/assets/list-active.png' : '/assets/list-inactive.png'} alt="List View" />
                </button>
                <button
                  className={view === 'grid' ? 'active' : ''}
                  onClick={() => setView('grid')}
                >
                  <img src={view === 'grid' ? '/assets/grid-active.png' : '/assets/grid-inactive.png'} alt="Grid View" />
                </button>
              </div>
              <button className="add-customer-btn">Add Customer</button>
            </div>
          </div>

          <div className="content-card">
            <div className="list-header">
                <h2 className="page-title">All Customers List</h2>
              <MonthDropdown onChange={handleMonthChange} />
            </div>
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Delete confirmation popup */}
      {showDeletePopup && (
        <PopupMessage
          onConfirm={handleDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default Customers;