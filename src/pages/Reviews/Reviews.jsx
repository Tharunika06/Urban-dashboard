// src/pages/Reviews/Reviews.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import io from "socket.io-client";
import Header from "../../components/layout/Header";
import MonthDropdown from "../../components/common/MonthDropdown";
import PopupMessage from "../../components/common/PopupMessage";
import Checkbox from "../../components/common/Checkbox";
import { 
  API_CONFIG, 
  DEFAULTS,
  ASSET_PATHS,
  UI_MESSAGES,
  BUTTON_LABELS,
  STYLES
} from "../../utils/constants";
import {
  applyReviewFilters,
  calculatePagination,
  getSelectedIds,
  toggleAllItems,
  toggleSingleItem,
  formatReviewDate,
  validateRating
} from "../../utils/reviewHelpers";
import "../../styles/Reviews.css";

const Reviews = () => {
  const [selectAll, setSelectAll] = useState(false);
  const [checkedRows, setCheckedRows] = useState({});
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState(DEFAULTS.SEARCH_TERM);
  const [selectedMonth, setSelectedMonth] = useState(DEFAULTS.SELECTED_MONTH);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showPopup, setShowPopup] = useState(false);
  const [deleteMode, setDeleteMode] = useState("single");
  const [selectedIds, setSelectedIds] = useState([]);

  const socketRef = useRef(null);

  const tableHeaders = [
    { 
      label: <Checkbox checked={selectAll} onChange={handleSelectAll} />,
      key: 'checkbox'
    },
    { label: 'Property Name', key: 'propertyName' },
    { label: 'Date', key: 'date' },
    { label: 'Customer Name', key: 'customerName' },
    { label: 'Property Address', key: 'propertyAddress' },
    { label: 'Rating', key: 'rating' },
    { label: 'Review', key: 'review' },
    { label: 'Status', key: 'status' },
    { label: 'Action', key: 'action' }
  ];

  // Socket.io setup with real-time updates
  useEffect(() => {
    socketRef.current = io(API_CONFIG.BASE_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on("update-analytics", (data) => {
      if (["review-added", "review-updated", "review-deleted"].includes(data.type)) {
        console.log('🔔 Received review update event:', data.type);
        fetchReviews(true);
      }
    });

    socket.on("review-deleted", (deletedId) => {
      console.log('🗑️ Review deleted via socket:', deletedId);
      setReviews((prev) => prev.filter((r) => r._id !== deletedId));
    });

    return () => {
      socket.disconnect();
      console.log('🔌 Socket.io disconnected');
    };
  }, []);

  // Fetch reviews on mount and set up polling
  useEffect(() => {
    fetchReviews();
    const refreshInterval = setInterval(() => {
      fetchReviews(true);
    }, API_CONFIG.AUTO_REFRESH_INTERVAL);
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchReviews = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await axios.get(`${API_CONFIG.BASE_URL}/api/reviews`, {
        timeout: API_CONFIG.TIMEOUT
      });
      setReviews(res.data);
      setFilteredReviews(res.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching reviews:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Filter reviews by search and month using utility functions
  useEffect(() => {
    const filtered = applyReviewFilters(reviews, {
      searchTerm,
      month: selectedMonth
    });
    setFilteredReviews(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedMonth, reviews]);

  // Calculate pagination using utility function
  const pagination = calculatePagination(filteredReviews, currentPage, itemsPerPage);
  const { totalPages, currentItems: currentReviews } = pagination;

  // Reset selections when page or data changes
  useEffect(() => {
    setSelectAll(false);
    setCheckedRows({});
  }, [currentPage, filteredReviews]);

  function handleSelectAll() {
    const updated = toggleAllItems(currentReviews, selectAll);
    setCheckedRows(updated);
    setSelectAll(!selectAll);
  }

  const toggleCheckbox = (id) => {
    const result = toggleSingleItem(checkedRows, id, currentReviews);
    setCheckedRows(result.checkedRows);
    setSelectAll(result.selectAll);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectAll(false);
      setCheckedRows({});
    }
  };

  const handleConfirmDelete = (id) => {
    setSelectedIds([id]);
    setDeleteMode("single");
    setShowPopup(true);
  };

  const handleBulkDeleteClick = () => {
    const ids = getSelectedIds(checkedRows);
    if (ids.length > 0) {
      setSelectedIds(ids);
      setDeleteMode("bulk");
      setShowPopup(true);
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteMode === "bulk") {
        await Promise.all(
          selectedIds.map((id) => 
            axios.delete(`${API_CONFIG.BASE_URL}/api/reviews/${id}`, {
              timeout: API_CONFIG.TIMEOUT
            })
          )
        );
        setReviews((prev) => prev.filter((r) => !selectedIds.includes(r._id)));
        alert(`${selectedIds.length} review(s) deleted successfully`);
      } else {
        await axios.delete(`${API_CONFIG.BASE_URL}/api/reviews/${selectedIds[0]}`, {
          timeout: API_CONFIG.TIMEOUT
        });
        setReviews((prev) => prev.filter((r) => r._id !== selectedIds[0]));
        alert('Review deleted successfully');
      }

      setShowPopup(false);
      setSelectedIds([]);
      setCheckedRows({});
      setSelectAll(false);
    } catch (err) {
      console.error("Error deleting reviews:", err);
      alert(`${UI_MESSAGES.DELETE_FAILED}: ${err.response?.data?.message || err.message}`);
      setShowPopup(false);
    }
  };

  const handleCancelDelete = () => {
    setShowPopup(false);
    setSelectedIds([]);
  };

  const selectedCount = getSelectedIds(checkedRows).length;

  return (
    <div className="app-layout">
      <div className="main-content">
        <Header />
        <div className="page-content reviews-wrapper">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div className="search-bar w-100 w-md-50 d-flex align-items-center">
              <img src={ASSET_PATHS.SEARCH_ICON} alt="search" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <section className="content-section">
            <div className="list-header">
              <h2 className="page-title">All Reviews List</h2>
              <MonthDropdown onChange={setSelectedMonth} />
            </div>

            {selectedCount > 0 && (
              <div className="bulk-actions-bar">
                <span className="selected-count">{selectedCount} selected</span>
                <button className="bulk-delete-btn" onClick={handleBulkDeleteClick}>
                  Delete Selected
                </button>
              </div>
            )}

            <div className="table-scroll-container">
              <table>
                <thead>
                  <tr>
                    {tableHeaders.map((header) => (
                      <th key={header.key}>{header.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={tableHeaders.length} style={STYLES.LOADING_STATE}>
                        Loading reviews...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={tableHeaders.length} style={STYLES.ERROR_STATE}>
                        Error: {error}
                      </td>
                    </tr>
                  ) : currentReviews.length === 0 ? (
                    <tr>
                      <td colSpan={tableHeaders.length} style={STYLES.EMPTY_STATE}>
                        No reviews found
                      </td>
                    </tr>
                  ) : (
                    currentReviews.map((r) => {
                      const validRating = validateRating(r.rating);
                      return (
                        <tr key={r._id}>
                          <td>
                            <Checkbox
                              checked={checkedRows[r._id] || false}
                              onChange={() => toggleCheckbox(r._id)}
                            />
                          </td>
                          <td>{r.propertyId?.name || "Unknown Property"}</td>
                          <td>{formatReviewDate(r.createdAt)}</td>
                          <td>{r.customerName || "N/A"}</td>
                          <td className="address">{r.propertyId?.address || "N/A"}</td>
                          <td>
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={i < Math.round(validRating) ? "filled-star" : "empty-star"}
                              />
                            ))}
                            <span className="rating-value">{validRating}/5</span>
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

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
                      className={`page-link ${currentPage === i + 1 ? "active" : ""}`}
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
          </section>
        </div>
      </div>

      {showPopup && (
        <PopupMessage
          title={deleteMode === "bulk" ? "Delete Selected Reviews" : "Delete Review"}
          message={
            deleteMode === "bulk"
              ? `Are you sure you want to delete ${selectedIds.length} selected review(s)? This process cannot be undone.`
              : "Do you really want to delete this review? This process cannot be undone."
          }
          icon={ASSET_PATHS.REMOVE_ICON}
          confirmLabel={BUTTON_LABELS.DELETE}
          cancelLabel={BUTTON_LABELS.CANCEL}
          onConfirm={handleDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default Reviews;