import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoClose, IoAdd, IoEnter, IoSearch, IoRefresh } from 'react-icons/io5';
import CreateRoomModal from '../../components/room/CreateRoomModal.jsx';
import RoomCard from '../../components/room/RoomCard.jsx';
import JoinByCodeModal from '../../components/room/JoinByCodeModal.jsx';
import PlayerList from '../../components/room/PlayerList.jsx';
import useRoomStore from '../../stores/useRoomStore.js';
import authStore from '../../stores/authStore.js';
import useWebSocketCleanup from '../../hooks/useWebSocketCleanup.js';
import '../../styles/pages/room/RoomPage.css';
import Decoration from '../../components/Decoration.jsx';
import SimpleBackground from '../../components/SimpleBackground.jsx';

const RoomsPage = () => {
    // Navigation and user management
    const navigate = useNavigate();
    const { user, logout } = authStore();

    // WebSocket cleanup
    useWebSocketCleanup();

    // Room management state and actions
    const {
        rooms,
        loading,
        error,
        loadRooms,
        joinRoom,
        clearError,
        startAutoRefresh,
        stopAutoRefresh,
        subscribeToRoomList,
        unsubscribeFromRoomList
    } = useRoomStore();

    // Local component state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinError, setJoinError] = useState('');
    const [success, setSuccess] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;


    useEffect(() => {
    }, [rooms]);


    useEffect(() => {
    }, [currentPage]);

    /**
     * Initialize room data and auto-refresh on component mount
     * Setup simple polling for room list updates instead of WebSocket
     * Cleanup auto-refresh on component unmount
     */
    useEffect(() => {
        loadRooms();

        // Simple auto-refresh every 10 seconds instead of WebSocket
        const refreshInterval = setInterval(() => {
            loadRooms();
        }, 10000); // 10 seconds

        return () => {
            clearInterval(refreshInterval);
            stopAutoRefresh();
        };
    }, [loadRooms, stopAutoRefresh]); // Removed WebSocket methods

    /**
     * Handle joining a public room
     * @param {string} roomCode - The room code to join
     */
    const handleJoinPublic = async (roomCode) => {

        // Validation
        if (!roomCode) {

            setJoinError('Mã phòng không hợp lệ');
            return;
        }

        // Clear previous errors and messages
        setJoinError('');
        setSuccess('');
        clearError();

        const result = await joinRoom(roomCode, true);

        if (result.success) {
            setSuccess('Đang chuyển hướng vào phòng chờ...');
            const targetRoom = result.data?.Code || roomCode;
            navigate(`/waiting-room/${targetRoom}`);
        } else {
            setJoinError(result.error);
        }
    };

    /**
     * Handle joining a private room by code
     * @param {string} roomCode - The room code to join
     */
    const handleJoinPrivate = async (roomCode) => {
        setJoinLoading(true);
        setJoinError('');

        const result = await joinRoom(roomCode, false);

        if (result.success) {
            setSuccess('Đang chuyển hướng vào phòng chờ...');
            const targetRoom = result.data?.Code || roomCode;
            setShowJoinModal(false);
            navigate(`/waiting-room/${targetRoom}`);
        } else {
            setJoinError(result.error);
        }

        setJoinLoading(false);
    };

    /**
     * Handle user logout
     */
    const handleLogout = () => {
        logout(navigate);
    };

    /**
     * Filter rooms based on search query
     */
    const filteredRooms = rooms.filter(room => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            (room.RoomName && room.RoomName.toLowerCase().includes(query)) ||
            (room.TopicName && room.TopicName.toLowerCase().includes(query)) ||
            (room.RoomCode && room.RoomCode.toLowerCase().includes(query))
        );
    });

    /**
     * Calculate pagination
     */
    const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRooms = filteredRooms.slice(startIndex, endIndex);

    /**
     * Generate smart pagination numbers
     * Shows first page, last page, current page and surrounding pages
     */
    const getPaginationNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Smart pagination logic
            const halfVisible = Math.floor(maxVisiblePages / 2);

            let startPage = Math.max(1, currentPage - halfVisible);
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            // Adjust startPage if we're near the end
            if (endPage === totalPages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            // Add first page if not included
            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) {
                    pages.push('...');
                }
            }

            // Add visible pages
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Add last page if not included
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    pages.push('...');
                }
                pages.push(totalPages);
            }
        }

        return pages;
    };

    /**
     * Handle page change
     */
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            // Scroll to top of room grid
            const roomGrid = document.querySelector('.room-grid');
            if (roomGrid) {
                roomGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
        }
    };

    /**
     * Handle search change and reset to first page
     */
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    /**
     * Format remaining time for room display
     * @param {string} endTime - End time string
     * @returns {string} Formatted time string
     */
    const formatTimeLeft = (endTime) => {
        if (!endTime) return 'Không giới hạn';

        const now = new Date();
        const end = new Date(endTime);
        const diff = end - now;

        if (diff <= 0) return 'Đã kết thúc';

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="room-page">
            <SimpleBackground />
            <main className="room-content">

                <div className="room-container">

                    <div className="room-wrapper">
                        <div className="room-header">
                            <div className="room-header-left">
                                <h1>Danh sách phòng</h1>
                                <button
                                    className="room-btn-refresh"
                                    onClick={() => loadRooms()}
                                    disabled={loading}
                                    title="Refresh danh sách phòng"
                                >
                                    <IoRefresh className={`room-refresh-icon ${loading ? 'spinning' : ''}`} />
                                </button>
                            </div>

                            <div className="room-actions">
                                <button
                                    className="room-btn-action room-btn-create"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    <IoAdd className="room-btn-icon" />
                                    <span>Tạo phòng mới</span>
                                </button>
                                <button
                                    className="room-btn-action room-btn-join"
                                    onClick={() => setShowJoinModal(true)}
                                >
                                    <IoEnter className="room-btn-icon" />
                                    <span>Tham gia bằng mã</span>
                                </button>
                            </div>
                        </div>

                        <div className="room-filter">
                            <div className="room-search-container">
                                <IoSearch className="room-search-icon" />
                                <input
                                    type="text"
                                    className="room-search-input"
                                    placeholder="Tìm kiếm phòng..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <div className="room-status-info">
                                <span className="status-indicator">●</span>
                                <span>Tự động cập nhật mỗi 10 giây</span>
                            </div>
                        </div>

                        {loading && rooms.length === 0 ? (
                            <div className="room-loading-container">
                                <div className="room-loading-spinner">
                                    <IoRefresh className="room-spinner-icon" />
                                </div>
                                <p>Đang tải danh sách phòng...</p>
                            </div>
                        ) : (
                            <div className="room-grid">
                                {currentRooms.length === 0 ? (
                                    <div className="room-empty">
                                        <div className="room-empty-icon">
                                            <IoSearch size={48} />
                                        </div>
                                        <h3>Không tìm thấy phòng nào</h3>
                                        <p>Hãy tạo phòng mới hoặc tham gia bằng mã phòng</p>
                                    </div>
                                ) : (
                                    currentRooms.map((room, index) => (
                                        <RoomCard
                                            key={room.RoomCode || `room-${index}`}
                                            room={room}
                                            onJoinPublic={handleJoinPublic}
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="room-pagination">
                                <button
                                    className="pagination-button pagination-nav pagination-prev"
                                    onClick={() => {
                                        handlePageChange(currentPage - 1);
                                    }}
                                    disabled={currentPage === 1}
                                    aria-label="Trang trước"
                                >
                                    <span className="pagination-arrow">‹</span>
                                    <span className="pagination-text">Trước</span>
                                </button>

                                <div className="pagination-numbers">
                                    {getPaginationNumbers().map((page, index) => (
                                        page === '...' ? (
                                            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={page}
                                                className={`pagination-button pagination-number ${page === currentPage ? 'active' : ''
                                                    }`}
                                                onClick={() => {
                                                    handlePageChange(page);
                                                }}
                                                aria-label={`Trang ${page}`}
                                                aria-current={page === currentPage ? 'page' : undefined}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))}
                                </div>

                                <button
                                    className="pagination-button pagination-nav pagination-next"
                                    onClick={() => {
                                        handlePageChange(currentPage + 1);
                                    }}
                                    disabled={currentPage === totalPages}
                                    aria-label="Trang sau"
                                >
                                    <span className="pagination-text">Sau</span>
                                    <span className="pagination-arrow">›</span>
                                </button>
                            </div>
                        )}

                        {/* Results info */}
                        {filteredRooms.length > 0 && (
                            <div className="room-results-info">
                                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredRooms.length)} của {filteredRooms.length} phòng
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showCreateModal && (
                <CreateRoomModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        loadRooms();
                    }}
                    onNavigateToRoom={(roomCode) => navigate(`/waiting-room/${roomCode}`)}
                />
            )}

            <JoinByCodeModal
                isOpen={showJoinModal}
                onClose={() => {
                    setShowJoinModal(false);
                    setJoinError('');
                }}
                onJoin={handleJoinPrivate}
                loading={joinLoading}
                error={joinError}
            />

            {(error || joinError) && !showJoinModal && (
                <div className="room-notification room-error">
                    {error || joinError}
                    <button onClick={() => { clearError(); setJoinError(''); }}>
                        <IoClose />
                    </button>
                </div>
            )}

            {success && !showJoinModal && (

                <div className="room-notification room-success">
                    {success}
                </div>
            )}
        </div>
    );
};

export default RoomsPage;
