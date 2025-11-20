// src/pages/Reviews/Reviews.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import io from "socket.io-client";
import reviewService from "../../services/reviewService";
import { usePagination } from "../../hooks/usePagination";
import Header from "../../components/layout/Header";
import MonthDropdown from "../../components/common/MonthDropdown";
import PopupMessage from "../../components/common/PopupMessage";
import SearchBar from "../../components/common/SearchBar";
import Checkbox from "../../components/common/Checkbox";
import { 
  API_CONFIG, 
  DEFAULTS,
  ASSET_PATHS,
  UI_MESSAGES,
  BUTTON_LABELS,
  PLACEHOLDERS,
  STYLES,
  MONTHS_FULL
} from "../../utils/constants";
import {
  getSelectedIds,
  toggleAllItems,
  toggleSingleItem,
  formatReviewDate,
  validateRating
} from "../../utils/reviewHelpers";
import "../../styles/Reviews.css";

const ITEMS_PER_PAGE = 5;

const Reviews = () => {
  const [selectAll, setSelectAll] = useState(false);
  const [checkedRows, setCheckedRows] = useState({});
  const [reviews, setReviews] = useState([]);
  const [searchFilteredReviews, setSearchFilteredReviews] = useState([]);
  const [displayReviews, setDisplayReviews] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(DEFAULTS.SELECTED_MONTH);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [deleteMode, setDeleteMode] = useState("single");
  const [selectedIds, setSelectedIds] = useState([]);

  const socketRef = useRef(null);

  // Use pagination hook
  const {
    currentPage,
    totalPages,
    currentItems: currentReviews,
    handlePageChange,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    resetPage
  } = usePagination(displayReviews, ITEMS_PER_PAGE);

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
        fetchReviews(true);
      }
    });

    socket.on("review-deleted", (deletedId) => {
      setReviews((prev) => prev.filter((r) => r._id !== deletedId));
    });

    return () => {
      socket.disconnect();
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
      const data = await reviewService.getAllReviews();
      setReviews(data);
      setSearchFilteredReviews(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch reviews');
      console.error("Error fetching reviews:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Handle search results from SearchBar
  const handleSearchResults = (filtered) => {
    setSearchFilteredReviews(filtered);
  };

  // Apply month filter to search results
  useEffect(() => {
    const filterByMonth = (reviewsList) => {
      if (selectedMonth === 'all') {
        return reviewsList;
      }

      const monthIndex = MONTHS_FULL.indexOf(selectedMonth);
      if (monthIndex === -1) return reviewsList;

      return reviewsList.filter(review => {
        if (!review.createdAt) return false;
        const date = new Date(review.createdAt);
        return date.getMonth() === monthIndex;
      });
    };

    const filtered = filterByMonth(searchFilteredReviews);
    setDisplayReviews(filtered);
    resetPage();
  }, [searchFilteredReviews, selectedMonth, resetPage]);

  // Reset selections when page or data changes
  useEffect(() => {
    setSelectAll(false);
    setCheckedRows({});
  }, [currentPage, displayReviews]);

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
        // Bulk delete using service
        await Promise.all(
          selectedIds.map((id) => reviewService.deleteReview(id))
        );
        setReviews((prev) => prev.filter((r) => !selectedIds.includes(r._id)));
      } else {
        // Single delete using service
        await reviewService.deleteReview(selectedIds[0]);
        setReviews((prev) => prev.filter((r) => r._id !== selectedIds[0]));
      }

      setShowPopup(false);
      setSelectedIds([]);
      setCheckedRows({});
      setSelectAll(false);
    } catch (err) {
      console.error("Error deleting reviews:", err);
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
            <SearchBar
              data={reviews}
              onFilteredResults={handleSearchResults}
              searchFields={['customerName', 'comment', 'propertyId.name', 'propertyId.address']}
              placeholder={PLACEHOLDERS.SEARCH}
              className="w-100 w-md-50"
            />
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
                    onClick={prevPage}
                    disabled={!hasPrevPage}
                    style={{
                      padding: '10px 20px',
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: hasPrevPage ? 'pointer' : 'not-allowed',
                      opacity: hasPrevPage ? 1 : 0.5,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>‹</span> Back
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      style={{
                        width: '45px',
                        height: '45px',
                        padding: '10px',
                        background: currentPage === i + 1 
                          ? 'linear-gradient(180deg, #474747 0%, #000000 100%)' 
                          : 'white',
                        color: currentPage === i + 1 ? '#fff' : '#000',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: currentPage === i + 1 ? '600' : '400'
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={nextPage}
                    disabled={!hasNextPage}
                    style={{
                      padding: '10px 20px',
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: hasNextPage ? 'pointer' : 'not-allowed',
                      opacity: hasNextPage ? 1 : 0.5,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    Next <span>›</span>
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