import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client'; // 导入 Socket.io 客户端
import MonthDropdown from '../../components/common/MonthDropdown';
import Header from '../../components/layout/Header';
import AddOwnerModal from '../Owners/AddOwnerModal';
import PopupMessage from '../../components/common/PopupMessage';

import '../../styles/Dashboard.css';
import '../../styles/Owners.css';

const API_BASE_URL = 'http://192.168.1.45:5000';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Owners = () => {
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ownersPerPage = 6;

  // 初始化 Socket.io 客户端
  useEffect(() => {
    const socket = io(API_BASE_URL);

    // 监听 owner-stats-updated 事件
    socket.on('update-analytics', (data) => {
      if (data.type === 'owner-stats-updated') {
        console.log(`🔔 Received owner-stats-updated event for owner ID: ${data.ownerId}`);
        fetchOwners(true); // 静默刷新业主数据
      }
    });

    // 清理 Socket.io 连接
    return () => {
      socket.disconnect();
      console.log('🔌 Socket.io disconnected');
    };
  }, []);

  useEffect(() => {
    fetchOwners();
    const refreshInterval = setInterval(() => {
      fetchOwners(true);
    }, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchOwners = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/owners`);
      const ownersArray = Array.isArray(res.data.owners) ? res.data.owners : [];
      setOwners(ownersArray);
      setFilteredOwners(ownersArray);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('❌ Failed to fetch owners:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const getOwnerPhotoSrc = (photo) => {
    if (photo && photo.startsWith('data:image/')) return photo;
    if (photo && photo.startsWith('/uploads/')) return `${API_BASE_URL}${photo}`;
    return '/assets/placeholder.png';
  };

  const handleImageError = (e) => {
    e.target.src = '/assets/default-avatar.png';
  };

  useEffect(() => {
    let ownersToFilter = Array.isArray(owners) ? owners : [];

    if (selectedMonth && selectedMonth !== '') {
      const monthIndex = months.indexOf(selectedMonth);
      if (monthIndex > -1) {
        ownersToFilter = ownersToFilter.filter(owner => {
          const ownerDate = new Date(owner.doj || owner.createdAt);
          return ownerDate.getMonth() === monthIndex;
        });
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      ownersToFilter = ownersToFilter.filter(
        (owner) =>
          owner.name?.toLowerCase().includes(term) ||
          owner.email?.toLowerCase().includes(term) ||
          owner.address?.toLowerCase().includes(term) ||
          owner.contact?.toLowerCase().includes(term)
      );
    }

    setFilteredOwners(ownersToFilter);
    setCurrentPage(1); // reset to first page after filter/search
  }, [searchTerm, selectedMonth, owners]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleSaveOwner = () => {
    fetchOwners();
  };

  const handleConfirmDelete = (ownerId) => {
    setOwnerToDelete(ownerId);
    setShowDeletePopup(true);
  };

  const handleDelete = async () => {
    if (!ownerToDelete) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/owners/${ownerToDelete}`);
      setOwners((prev) => prev.filter((owner) => owner.ownerId !== ownerToDelete));
      setFilteredOwners((prev) => prev.filter((owner) => owner.ownerId !== ownerToDelete));
      setShowDeletePopup(false);
      setOwnerToDelete(null);
    } catch (err) {
      console.error('❌ Failed to delete owner:', err);
      alert(err.response?.data?.message || 'Failed to delete owner');
      setShowDeletePopup(false);
      setOwnerToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setOwnerToDelete(null);
  };

  // Pagination logic
  const indexOfLastOwner = currentPage * ownersPerPage;
  const indexOfFirstOwner = indexOfLastOwner - ownersPerPage;
  const currentOwners = filteredOwners.slice(indexOfFirstOwner, indexOfLastOwner);
  const totalPages = Math.ceil(filteredOwners.length / ownersPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const renderTableContent = () => {
    if (isLoading) return (
      <tr><td colSpan="8" className="loading-state">Loading owners...</td></tr>
    );

    if (error) return (
      <tr>
        <td colSpan="8" className="error-state">
          <div style={{ textAlign: 'center', padding: '20px', color: '#f44336' }}>
            <p>Error: {error}</p>
            <button onClick={() => fetchOwners()} className="retry-btn">Retry</button>
          </div>
        </td>
      </tr>
    );

    if (!Array.isArray(filteredOwners) || filteredOwners.length === 0)
      return <tr><td colSpan="8" style={{ textAlign: 'center' }}>No owners found</td></tr>;

    return currentOwners.map((owner) => (
      <tr key={owner._id || owner.ownerId}>
        <td>
          <div className="owner-info">
            <img
              src={getOwnerPhotoSrc(owner.photo)}
              alt={owner.name || 'No Name'}
              className="owner-photo"
              onError={handleImageError}
            />
            {owner?.name ? (
              <Link to={`/owners/${owner.ownerId}`} className="owner-link">
                {owner.name}
              </Link>
            ) : 'N/A'}
          </div>
        </td>
        <td>{owner.address || '-'}</td>
        <td>{owner.email || '-'}</td>
        <td>{owner.contact || '-'}</td>
        <td>{owner.propertyOwned || 0}</td>
        <td>{owner.doj ? new Date(owner.doj).toLocaleDateString() : '-'}</td>
        <td><span className={`status ${owner.status?.toLowerCase()}`}>{owner.status || 'Active'}</span></td>
        <td className="action-icons">
          <Link to={`/owners/${owner.ownerId}`}>
            <img src="/assets/view-icon.png" alt="View" title="View Details" />
          </Link>
          <img
            src="/assets/delete-icon.png"
            alt="Delete"
            title="Delete Owner"
            onClick={() => handleConfirmDelete(owner.ownerId)}
            style={{ cursor: 'pointer' }}
          />
        </td>
      </tr>
    ));
  };

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <Header title="Property Owners" />

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

            <button
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
              style={{
                backgroundColor: '#000',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              New Owner
            </button>
          </div>

          <section className="content-section">
            <div className="content-header">
              <h2>All Owner List <span className="subtext">({filteredOwners.length} Owners)</span></h2>
              <div className="content-actions">
                <MonthDropdown onChange={handleMonthChange} />
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Owner Photo & Name</th>
                    <th>Address</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Properties</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>{renderTableContent()}</tbody>
              </table>
            </div>

            {/* Pagination Section */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-link"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  « Back
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`page-link ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="page-link"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  Next »
                </button>
              </div>
            )}
          </section>
        </main>
      </div>

      <AddOwnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveOwner}
      />

      {showDeletePopup && (
        <PopupMessage onConfirm={handleDelete} onCancel={handleCancelDelete} />
      )}
    </div>
  );
};

export default Owners;