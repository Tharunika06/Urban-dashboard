// src/pages/Reviews/Review.jsx
import React, { useState, useEffect, useRef } from "react";
import "../../styles/Reviews.css";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import Header from "../../components/layout/Header";
import MonthDropdown from "../../components/common/MonthDropdown";
import PopupMessage from "../../components/common/PopupMessage";
import Checkbox from "../../components/common/Checkbox";
import axios from "axios";
import io from "socket.io-client";

const API_BASE_URL = "http://192.168.0.152:5000";
const API_URL = `${API_BASE_URL}/api/reviews`;

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Reviews = () => {
  const [selectAll, setSelectAll] = useState(false);
  const [checkedRows, setCheckedRows] = useState({});
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Popup state management
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Socket reference
  const socketRef = useRef(null);

  // ✅ Initialize Socket.IO connection for real-time updates
  useEffect(() => {
    console.log('🔌 Initializing Socket.IO connection for Reviews...');
    socketRef.current = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    const socket = socketRef.current;

    // ✅ Listen for real-time review events
    socket.on('update-analytics', (data) => {
      console.log('📦 Received update-analytics event:', data);
      
      if (data.type === 'review-added') {
        console.log('🔔 New review added, refreshing data...');
        fetchReviews(true); // Silent refresh
      } else if (data.type === 'review-updated') {
        console.log('📝 Review updated, refreshing data...');
        fetchReviews(true); // Silent refresh
      } else if (data.type === 'review-deleted') {
        console.log('🗑️ Review deleted, refreshing data...');
        fetchReviews(true); // Silent refresh
      }
    });

    // ✅ Listen for specific review events (if your backend emits these)
    socket.on('new-review', (newReview) => {
      console.log('🆕 New review received:', newReview);
      setReviews((prev) => [newReview, ...prev]);
    });

    socket.on('review-updated', (updatedReview) => {
      console.log('✏️ Review updated:', updatedReview);
      setReviews((prev) =>
        prev.map((r) => (r._id === updatedReview._id ? updatedReview : r))
      );
    });

    socket.on('review-deleted', (deletedId) => {
      console.log('🗑️ Review deleted:', deletedId);
      setReviews((prev) => prev.filter((r) => r._id !== deletedId));
    });

    // ✅ Connection status monitoring
    socket.on('connect', () => {
      console.log('✅ Socket.IO connected to Reviews:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected from Reviews:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
    });

    // ✅ Cleanup function
    return () => {
      console.log('🧹 Cleaning up Socket.IO connection for Reviews...');
      socket.off('update-analytics');
      socket.off('new-review');
      socket.off('review-updated');
      socket.off('review-deleted');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  // ✅ Fetch reviews from backend (with optional silent mode)
  useEffect(() => {
    fetchReviews();
    
    // ✅ Set up periodic refresh as fallback (every 30 seconds)
    const refreshInterval = setInterval(() => {
      console.log('🔄 Periodic refresh triggered...');
      fetchReviews(true); // Silent refresh
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  const fetchReviews = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
        console.log('⏳ Loading reviews...');
      }
      
      const res = await axios.get(API_URL);
      console.log(`✅ Fetched ${res.data.length} reviews`);
      
      setReviews(res.data);
      setFilteredReviews(res.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("❌ Error fetching reviews:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Filter reviews based on search term and selected month
  useEffect(() => {
    let reviewsToFilter = reviews;

    if (selectedMonth && selectedMonth !== '') {
      const monthIndex = months.indexOf(selectedMonth);
      if (monthIndex > -1) {
        reviewsToFilter = reviewsToFilter.filter(review => {
          const reviewDate = new Date(review.createdAt);
          return reviewDate.getMonth() === monthIndex;
        });
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      reviewsToFilter = reviewsToFilter.filter(
        (review) =>
          review.customerName?.toLowerCase().includes(term) ||
          review.propertyId?.name?.toLowerCase().includes(term) ||
          review.propertyId?.address?.toLowerCase().includes(term) ||
          review.comment?.toLowerCase().includes(term)
      );
    }

    setFilteredReviews(reviewsToFilter);
    setCurrentPage(1);
  }, [searchTerm, selectedMonth, reviews]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReviews = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

  // Reset checkboxes when page changes or filtered reviews change
  useEffect(() => {
    setSelectAll(false);
    setCheckedRows({});
  }, [currentPage, filteredReviews]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleSelectAll = () => {
    const updated = {};
    currentReviews.forEach((r) => {
      updated[r._id] = !selectAll;
    });
    setCheckedRows(updated);
    setSelectAll(!selectAll);
  };

  const toggleCheckbox = (id) => {
    setCheckedRows((prev) => {
      const newChecked = { ...prev, [id]: !prev[id] };
      
      // Check if all current page items are selected
      const allSelected = currentReviews.every(
        r => newChecked[r._id]
      );
      setSelectAll(allSelected);
      
      return newChecked;
    });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectAll(false);
      setCheckedRows({});
    }
  };

  // Show confirmation popup for single delete
  const handleConfirmDelete = (id) => {
    console.log('📋 Review selected for deletion:', id);
    setReviewToDelete(id);
    setShowDeletePopup(true);
  };

  // Single delete handler with API call
  const handleDelete = async () => {
    if (!reviewToDelete) return;

    try {
      console.log('🗑️ Attempting to delete review with ID:', reviewToDelete);
      
      await axios.delete(`${API_URL}/${reviewToDelete}`);
      
      // Update local state
      setReviews((prev) => prev.filter((r) => r._id !== reviewToDelete));
      setCheckedRows((prev) => {
        const newChecked = { ...prev };
        delete newChecked[reviewToDelete];
        return newChecked;
      });
      
      console.log('✅ Review deleted successfully');
      setShowDeletePopup(false);
      setReviewToDelete(null);
      
    } catch (err) {
      console.error('❌ Error deleting review:', err);
      alert('Failed to delete review: ' + (err.response?.data?.message || err.message));
      setShowDeletePopup(false);
      setReviewToDelete(null);
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async (selectedIds) => {
    if (selectedIds.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} review(s)?`
    );

    if (!confirmDelete) return;

    try {
      console.log(`🗑️ Bulk deleting ${selectedIds.length} reviews...`);
      
      // Delete all selected reviews
      await Promise.all(
        selectedIds.map((id) => axios.delete(`${API_URL}/${id}`))
      );

      // Update local state
      setReviews((prev) => prev.filter((r) => !selectedIds.includes(r._id)));
      setCheckedRows({});
      setSelectAll(false);

      console.log('✅ Bulk delete completed successfully');
    } catch (err) {
      console.error('❌ Error deleting reviews:', err);
      alert('Failed to delete some reviews: ' + (err.response?.data?.message || err.message));
    }
  };

  // Cancel delete popup
  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setReviewToDelete(null);
  };

  // Get selected review IDs
  const getSelectedIds = () => {
    return Object.keys(checkedRows).filter(id => checkedRows[id]);
  };

  const selectedCount = getSelectedIds().length;

  const handleBulkDeleteClick = () => {
    const selectedIds = getSelectedIds();
    if (selectedIds.length > 0) {
      handleBulkDelete(selectedIds);
    }
  };

  return (
    <div className="app-layout">
      <div className="main-content">
        <Header />
        <div className="page-content reviews-wrapper">
          {/* Search Bar */}
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
          </div>

          <section className="content-section">
            {/* Header - Stays fixed during horizontal scroll */}
            <div className="list-header">
              <h2 className="page-title">All Reviews List</h2>
              <MonthDropdown onChange={handleMonthChange} />
            </div>
            
            <div className="reviews-table">
              {/* Bulk Actions Bar */}
              {selectedCount > 0 && (
                <div className="bulk-actions-bar">
                  <span className="selected-count">{selectedCount} selected</span>
                  <button 
                    className="bulk-delete-btn"
                    onClick={handleBulkDeleteClick}
                  >
                    Delete Selected
                  </button>
                </div>
              )}

              {/* Scrollable table container */}
              <div className="table-scroll-container">
                <table>
                  <thead>
                    <tr>
                      <th>
                        <Checkbox 
                          checked={selectAll} 
                          onChange={handleSelectAll}
                          id="select-all-checkbox"
                        />
                      </th>
                      <th>Property Name</th>
                      <th>Date</th>
                      <th>Customer Name</th>
                      <th>Property Address</th>
                      <th>Rating</th>
                      <th>Review</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                          Loading reviews...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: '#f44336' }}>
                          <p>Error: {error}</p>
                          <button onClick={() => fetchReviews()} className="retry-btn" style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#1a73e8',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}>
                            Retry
                          </button>
                        </td>
                      </tr>
                    ) : currentReviews.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                          No reviews found
                        </td>
                      </tr>
                    ) : (
                      currentReviews.map((r) => (
                        <tr key={r._id}>
                          <td>
                            <Checkbox
                              checked={checkedRows[r._id] || false}
                              onChange={() => toggleCheckbox(r._id)}
                              id={`checkbox-${r._id}`}
                            />
                          </td>
                          <td>{r.propertyId?.name || "Unknown Property"}</td>
                          <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                          <td>{r.customerName}</td>
                          <td className="address">{r.propertyId?.address || "N/A"}</td>
                          <td>
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={i < Math.round(r.rating) ? "filled-star" : "empty-star"}
                              />
                            ))}
                            <span className="rating-value">{r.rating}/5</span>
                          </td>
                          <td><p>{r.comment}</p></td>
                          <td><span className="status-tag published">Published</span></td>
                          <td className="action-icons">
                            <Link to={`/reviews/${r._id}`}>
                              <img src="/assets/view-icon.png" alt="View" />
                            </Link>
                            <img
                              src="/assets/delete-icon.png"
                              alt="Delete"
                              onClick={() => handleConfirmDelete(r._id)}
                              style={{ cursor: "pointer" }}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Stays fixed at bottom */}
              {totalPages > 1 && (
                <div className="pagination-wrapper">
                  <div className="pagination">
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      « Back
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        className={`page-link ${currentPage === i + 1 ? 'active' : ''}`}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next »
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
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

export default Reviews;