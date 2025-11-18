import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight, FiMoreVertical } from 'react-icons/fi';
import PopupNotification from '../../../components/PopupNotification';
import { usePopup } from '../../../hooks/usePopup';
import adminApi from '../services/adminApi';
import '../../../styles/features/teacher/Management.css';

const TopicManagement = () => {
    const { popup, showSuccess, showError, showConfirm, hidePopup } = usePopup();
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [dropdownOpen, setDropdownOpen] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadTopics();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        loadTopics();
    }, [currentPage]);

    useEffect(() => {
        const handleClickOutside = () => setDropdownOpen(null);
        if (dropdownOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [dropdownOpen]);

    const loadTopics = async () => {
        try {
            setLoading(true);
            const response = await adminApi.searchTopics(searchTerm, currentPage, 10);
            if (response.data) {
                setTopics(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || 0);
            }
        } catch (error) {
            showError('Không thể tải danh sách chủ đề');
            setTopics([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTopic) {
                await adminApi.updateTopic(editingTopic.id, formData);
                showSuccess('Cập nhật chủ đề thành công');
            } else {
                await adminApi.createTopic(formData);
                showSuccess('Tạo chủ đề thành công');
            }
            setShowModal(false);
            setFormData({ name: '', description: '' });
            setEditingTopic(null);
            setCurrentPage(0);
            loadTopics();
        } catch (error) {
            showError(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleEdit = (topic) => {
        setEditingTopic(topic);
        setFormData({ name: topic.name, description: topic.description });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        showConfirm(
            'Bạn có chắc muốn xóa chủ đề này? Hành động này không thể hoàn tác.',
            async () => {
                try {
                    await adminApi.deleteTopic(id);
                    showSuccess('Xóa chủ đề thành công');
                    loadTopics();
                } catch (error) {
                    showError('Không thể xóa chủ đề');
                }
            },
            'Xác nhận xóa',
            'Xóa',
            'Hủy'
        );
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (loading && topics.length === 0) return <div className="loading">Đang tải...</div>;

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>Quản lý Chủ đề</h1>
                <button className="btn-primary" onClick={() => { 
                    setShowModal(true); 
                    setEditingTopic(null); 
                    setFormData({ name: '', description: '' }); 
                }}>
                    <FiPlus /> Thêm chủ đề
                </button>
            </div>

            <div className="filter-section">
                <div className="search-bar-compact">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm chủ đề..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-info">
                <span>Hiển thị {topics.length > 0 ? currentPage * 10 + 1 : 0} - {Math.min((currentPage + 1) * 10, totalElements)} trong tổng số {totalElements} chủ đề</span>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>STT</th>
                            <th>Tên chủ đề</th>
                            <th>Mô tả</th>
                            <th>Ngày tạo</th>
                            <th>Cập nhật</th>
                            <th style={{ width: '120px' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Đang tải...</td>
                            </tr>
                        ) : topics.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                    {searchTerm ? 'Không tìm thấy chủ đề phù hợp' : 'Chưa có chủ đề nào'}
                                </td>
                            </tr>
                        ) : (
                            topics.map((topic, index) => (
                                <tr key={topic.id}>
                                    <td>{currentPage * 10 + index + 1}</td>
                                    <td style={{ fontWeight: '600' }}>{topic.name}</td>
                                    <td>{topic.description}</td>
                                    <td>{topic.createdAt ? new Date(topic.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                                    <td>{topic.updatedAt ? new Date(topic.updatedAt).toLocaleDateString('vi-VN') : '-'}</td>
                                    <td>
                                        <div className="dropdown-container" style={{ position: 'relative' }}>
                                            <button 
                                                className="btn-dropdown" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDropdownOpen(dropdownOpen === topic.id ? null : topic.id);
                                                }}
                                                title="Tùy chọn"
                                            >
                                                <FiMoreVertical />
                                            </button>
                                            {dropdownOpen === topic.id && (
                                                <div className="dropdown-menu">
                                                    <button onClick={() => { handleEdit(topic); setDropdownOpen(null); }}>
                                                        <FiEdit2 /> Chỉnh sửa
                                                    </button>
                                                    <button onClick={() => { handleDelete(topic.id); setDropdownOpen(null); }} className="delete-option">
                                                        <FiTrash2 /> Xóa
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>
                        <FiChevronLeft /> Trước
                    </button>
                    <div className="pagination-pages">
                        {[...Array(totalPages)].map((_, index) => {
                            if (index === 0 || index === totalPages - 1 || (index >= currentPage - 1 && index <= currentPage + 1)) {
                                return (
                                    <button key={index} className={`pagination-page ${index === currentPage ? 'active' : ''}`} onClick={() => handlePageChange(index)}>
                                        {index + 1}
                                    </button>
                                );
                            } else if (index === currentPage - 2 || index === currentPage + 2) {
                                return <span key={index} className="pagination-ellipsis">...</span>;
                            }
                            return null;
                        })}
                    </div>
                    <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}>
                        Sau <FiChevronRight />
                    </button>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingTopic ? 'Cập nhật chủ đề' : 'Thêm chủ đề mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tên chủ đề *</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-submit">{editingTopic ? 'Cập nhật' : 'Tạo mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <PopupNotification
                type={popup.type}
                title={popup.title}
                message={popup.message}
                isVisible={popup.isVisible}
                onClose={hidePopup}
                showConfirm={popup.showConfirm}
                onConfirm={popup.onConfirm}
                onCancel={popup.onCancel}
                confirmText={popup.confirmText}
                cancelText={popup.cancelText}
            />
        </div>
    );
};

export default TopicManagement;
