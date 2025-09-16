// src/pages/Reviews/Review.jsx
import React, { useState, useEffect } from "react";
import "../../styles/Reviews.css";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import Header from "../../components/layout/Header";
import MonthDropdown from "../../components/common/MonthDropdown";
import axios from "axios";

const API_URL = "http://192.168.0.152:5000/api/reviews"; // backend reviews API

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Reviews = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ Fetch reviews from backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(API_URL);
        setReviews(res.data);
        setFilteredReviews(res.data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching reviews:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

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
    setCurrentPage(1); // reset to page 1 whenever filters change
  }, [searchTerm, selectedMonth, reviews]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(currentReviews.map((r) => r._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } catch (err) {
      console.error("Error deleting review:", err);
      alert('Failed to delete review. Please try again.');
    }
  };

  // ✅ Pagination calculations
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReviews = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const allChecked =
    currentReviews.length > 0 &&
    currentReviews.every((r) => selectedIds.includes(r._id));

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

          <div className="reviews-table-header">
            <h2>
              All Reviews List <span className="subtext">({filteredReviews.length} Reviews)</span>
            </h2>
            <MonthDropdown onChange={handleMonthChange} />
          </div>

          <div className="reviews-table">
            <table>
              <thead>
                <tr>
                  <th>
                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                      <span className="checkmark"></span>
                    </label>
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
                    <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                      Error: {error}
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
                        <label className="custom-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(r._id)}
                            onChange={() => handleSelectOne(r._id)}
                          />
                          <span className="checkmark"></span>
                        </label>
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
                          onClick={() => handleDelete(r._id)}
                          style={{ cursor: "pointer" }}
                        />
                        <img src="/assets/edit-icon.png" alt="Edit" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* ✅ Pagination (same as transactions) */}
            {totalPages > 1 && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
