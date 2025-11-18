import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import PopupNotification from '../../../components/PopupNotification';
import { usePopup } from '../../../hooks/usePopup';
import teacherApi from '../services/teacherApi';
import '../../../styles/features/teacher/Management.css';

const ExamManagement = () => {
    const { popup, showSuccess, showError, showConfirm, hidePopup } = usePopup();
    const [exams, setExams] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', topicId: '' });
    
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        loadTopics();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadExams();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        loadExams();
    }, [currentPage, sortOrder, selectedTopic]);

    const loadTopics = async () => {
        try {
            const response = await teacherApi.getAllTopics();
            setTopics(response.data || []);
        } catch (error) {
            showError('Không thể tải danh sách chủ đề');
        }
    };

    const loadExams = useCallback(async () => {
        try {
            setLoading(true);
            const sortParam = `id,${sortOrder}`;
            const topicIdParam = selectedTopic && selectedTopic !== '' ? parseInt(selectedTopic) : null;
            const response = await teacherApi.searchExams(searchTerm, topicIdParam, currentPage, 10, sortParam);
            
            if (response.data) {
                const pageData = response.data;
                setExams(pageData.content || []);
                setTotalPages(pageData.totalPages || 0);
                setTotalElements(pageData.totalElements || 0);
            }
        } catch (error) {
            console.error('Error loading exams:', error);
            showError('Không thể tải danh sách bộ đề');
            setExams([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, sortOrder, searchTerm, selectedTopic]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                topicId: parseInt(formData.topicId)
            };

            if (editingExam) {
                await teacherApi.updateExam(editingExam.id, payload);
                showSuccess('Cập nhật bộ đề thành công');
            } else {
                await teacherApi.createExam(payload);
                showSuccess('Tạo bộ đề thành công');
            }
            setShowModal(false);
            setFormData({ title: '', description: '', topicId: '' });
            setEditingExam(null);
            setCurrentPage(0);
            loadExams();
        } catch (error) {
            showError(editingExam ? 'Không thể cập nhật bộ đề' : 'Không thể tạo bộ đề');
        }
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(0);
    };

    const handleTopicFilter = (value) => {
        setSelectedTopic(value);
        setCurrentPage(0);
    };

    const handleSort = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        setCurrentPage(0);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleEdit = (exam) => {
        setEditingExam(exam);
        setFormData({ 
            title: exam.title, 
            description: exam.description,
            topicId: exam.topicId 
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        showConfirm(
            'Bạn có chắc muốn xóa bộ đề này? Tất cả câu hỏi trong bộ đề cũng sẽ bị xóa.',
            async () => {
                try {
                    await teacherApi.deleteExam(id);
                    showSuccess('Xóa bộ đề thành công');
                    loadExams();
                } catch (error) {
                    showError('Không thể xóa bộ đề');
                }
            },
            'Xác nhận xóa',
            'Xóa',
            'Hủy'
        );
    };

    const getSortIcon = () => {
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    const getRowNumber = (index) => {
        return currentPage * 10 + index + 1;
    };

    if (loading && exams.length === 0) return <div className="loading">Đang tải...</div>;

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>Quản lý Bộ đề</h1>
                <button className="btn-primary" onClick={() => { 
                    setShowModal(true); 
                    setEditingExam(null); 
                    setFormData({ title: '', description: '', topicId: '' }); 
                }}>
                    <FiPlus /> Thêm bộ đề
                </button>
            </div>

            <div className="filter-section">
                <div className="search-bar-compact">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bộ đề..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <select 
                    value={selectedTopic} 
                    onChange={(e) => handleTopicFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="">Tất cả chủ đề</option>
                    {topics.map(topic => (
                        <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                </select>
            </div>

            <div className="table-info">
                <span>Hiển thị {exams.length > 0 ? currentPage * 10 + 1 : 0} - {Math.min((currentPage + 1) * 10, totalElements)} trong tổng số {totalElements} bộ đề</span>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>STT</th>
                            <th style={{ cursor: 'pointer' }} onClick={handleSort}>
                                Tên bộ đề {getSortIcon()}
                            </th>
                            <th>Mô tả</th>
                            <th style={{ width: '150px' }}>Chủ đề</th>
                            <th style={{ width: '120px' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div className="spinner-small"></div>
                                    Đang tải...
                                </td>
                            </tr>
                        ) : exams.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                    {searchTerm || selectedTopic ? 'Không tìm thấy bộ đề phù hợp' : 'Chưa có bộ đề nào'}
                                </td>
                            </tr>
                        ) : (
                            exams.map((exam, index) => (
                                <tr key={exam.id}>
                                    <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                                        {getRowNumber(index)}
                                    </td>
                                    <td style={{ fontWeight: '600' }}>{exam.title}</td>
                                    <td style={{ maxWidth: '400px' }}>{exam.description}</td>
                                    <td>{topics.find(t => t.id === exam.topicId)?.name || '-'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-edit" onClick={() => handleEdit(exam)} title="Sửa">
                                                <FiEdit2 />
                                            </button>
                                            <button className="btn-delete" onClick={() => handleDelete(exam.id)} title="Xóa">
                                                <FiTrash2 />
                                            </button>
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
                    <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                    >
                        <FiChevronLeft /> Trước
                    </button>
                    
                    <div className="pagination-pages">
                        {[...Array(totalPages)].map((_, index) => {
                            if (
                                index === 0 || 
                                index === totalPages - 1 || 
                                (index >= currentPage - 1 && index <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={index}
                                        className={`pagination-page ${index === currentPage ? 'active' : ''}`}
                                        onClick={() => handlePageChange(index)}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            } else if (index === currentPage - 2 || index === currentPage + 2) {
                                return <span key={index} className="pagination-ellipsis">...</span>;
                            }
                            return null;
                        })}
                    </div>
                    
                    <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                    >
                        Sau <FiChevronRight />
                    </button>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingExam ? 'Cập nhật bộ đề' : 'Thêm bộ đề mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tên bộ đề *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="Ví dụ: Đề thi giữa kỳ môn Toán"
                                />
                            </div>
                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    placeholder="Mô tả chi tiết về bộ đề..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Chủ đề *</label>
                                <select
                                    value={formData.topicId}
                                    onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                                    required
                                >
                                    <option value="">Chọn chủ đề</option>
                                    {topics.map(topic => (
                                        <option key={topic.id} value={topic.id}>{topic.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-submit">
                                    {editingExam ? 'Cập nhật' : 'Tạo mới'}
                                </button>
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

export default ExamManagement;
