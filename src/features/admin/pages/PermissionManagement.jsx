import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight, FiMoreVertical } from 'react-icons/fi';
import adminApi from '../services/adminApi';
import PopupNotification from '../../../components/PopupNotification';
import { usePopup } from '../../../hooks/usePopup';
import '../../../styles/features/teacher/Management.css';

const PermissionManagement = () => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPermission, setEditingPermission] = useState(null);
    const [formData, setFormData] = useState({ permissionName: '', description: '' });
    const [dropdownOpen, setDropdownOpen] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    const { popup, showSuccess, showError, showConfirm, hidePopup } = usePopup();

    useEffect(() => {
        const timer = setTimeout(() => {
            loadPermissions();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        loadPermissions();
    }, [currentPage]);

    useEffect(() => {
        const handleClickOutside = () => setDropdownOpen(null);
        if (dropdownOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [dropdownOpen]);

    const loadPermissions = async () => {
        try {
            setLoading(true);
            const response = await adminApi.searchPermissions(searchTerm, currentPage, 10);
            if (response.data) {
                setPermissions(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || 0);
            }
        } catch (error) {
            showError('Không thể tải danh sách quyền');
            setPermissions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPermission) {
                await adminApi.updatePermission(editingPermission.id, formData);
                showSuccess('Cập nhật quyền thành công');
            } else {
                await adminApi.createPermission(formData);
                showSuccess('Tạo quyền thành công');
            }
            setShowModal(false);
            setFormData({ permissionName: '', description: '' });
            setEditingPermission(null);
            setCurrentPage(0);
            loadPermissions();
        } catch (error) {
            showError(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleEdit = (permission) => {
        setEditingPermission(permission);
        setFormData({ permissionName: permission.permissionName, description: permission.description });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        showConfirm(
            'Bạn có chắc muốn xóa quyền này? Hành động này không thể hoàn tác.',
            async () => {
                try {
                    await adminApi.deletePermission(id);
                    showSuccess('Xóa quyền thành công');
                    loadPermissions();
                } catch (error) {
                    showError('Không thể xóa quyền');
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

    if (loading && permissions.length === 0) return <div className="loading">Đang tải...</div>;

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>Quản lý Quyền</h1>
                <button className="btn-primary" onClick={() => { 
                    setShowModal(true); 
                    setEditingPermission(null); 
                    setFormData({ permissionName: '', description: '' }); 
                }}>
                    <FiPlus /> Thêm quyền
                </button>
            </div>

            <div className="filter-section">
                <div className="search-bar-compact">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm quyền..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-info">
                <span>Hiển thị {permissions.length > 0 ? currentPage * 10 + 1 : 0} - {Math.min((currentPage + 1) * 10, totalElements)} trong tổng số {totalElements} quyền</span>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>STT</th>
                            <th>Tên quyền</th>
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
                        ) : permissions.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                    {searchTerm ? 'Không tìm thấy quyền phù hợp' : 'Chưa có quyền nào'}
                                </td>
                            </tr>
                        ) : (
                            permissions.map((permission, index) => {
                                return (
                                <tr key={permission.id}>
                                    <td>{currentPage * 10 + index + 1}</td>
                                    <td style={{ fontWeight: '600' }}>{permission.permissionName || '-'}</td>
                                    <td>{permission.description}</td>
                                    <td>{permission.createdAt ? new Date(permission.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                                    <td>{permission.updatedAt ? new Date(permission.updatedAt).toLocaleDateString('vi-VN') : '-'}</td>
                                    <td>
                                        <div className="dropdown-container" style={{ position: 'relative' }}>
                                            <button 
                                                className="btn-dropdown" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDropdownOpen(dropdownOpen === permission.id ? null : permission.id);
                                                }}
                                                title="Tùy chọn"
                                            >
                                                <FiMoreVertical />
                                            </button>
                                            {dropdownOpen === permission.id && (
                                                <div className="dropdown-menu" style={{ zIndex: 1001 }}>
                                                    <button onClick={() => { handleEdit(permission); setDropdownOpen(null); }}>
                                                        <FiEdit2 /> Chỉnh sửa
                                                    </button>
                                                    <button onClick={() => { handleDelete(permission.id); setDropdownOpen(null); }} className="delete-option">
                                                        <FiTrash2 /> Xóa
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                );
                            })
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
                        <h2>{editingPermission ? 'Cập nhật quyền' : 'Thêm quyền mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tên quyền *</label>
                                <input type="text" value={formData.permissionName} onChange={(e) => setFormData({ ...formData, permissionName: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-submit">{editingPermission ? 'Cập nhật' : 'Tạo mới'}</button>
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

export default PermissionManagement;
