import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight, FiSettings, FiMoreVertical, FiCheck } from 'react-icons/fi';
import adminApi from '../services/adminApi';
import PopupNotification from '../../../components/PopupNotification';
import { usePopup } from '../../../hooks/usePopup';
import '../../../styles/features/teacher/Management.css';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [rolePermissions, setRolePermissions] = useState([]);
    const [originalRolePermissions, setOriginalRolePermissions] = useState([]);
    const [formData, setFormData] = useState({ roleName: '', description: '' });
    const [dropdownOpen, setDropdownOpen] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    const { popup, showSuccess, showError, showConfirm, hidePopup } = usePopup();

    useEffect(() => {
        loadPermissions();
    }, []);

    useEffect(() => {
        const handleClickOutside = () => setDropdownOpen(null);
        if (dropdownOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [dropdownOpen]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadRoles();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        loadRoles();
    }, [currentPage]);

    const loadPermissions = async () => {
        try {
            const response = await adminApi.getAllPermissions();
            setPermissions(response.data || []);
        } catch (error) {
            showError('Không thể tải danh sách quyền');
        }
    };

    const loadRoles = async () => {
        try {
            setLoading(true);
            const response = await adminApi.searchRoles(searchTerm, currentPage, 10);
            console.log('Roles response:', response);
            if (response.data) {
                console.log('Roles data:', response.data.content);
                setRoles(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || 0);
            }
        } catch (error) {
            showError('Không thể tải danh sách vai trò');
            setRoles([]);
        } finally {
            setLoading(false);
        }
    };

    const loadRolePermissions = async (roleId) => {
        try {
            const response = await adminApi.getRolePermissions(roleId);
            const permissions = response.data || [];
            setRolePermissions(permissions);
            setOriginalRolePermissions(permissions);
        } catch (error) {
            showError('Không thể tải quyền của vai trò');
            setRolePermissions([]);
            setOriginalRolePermissions([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRole) {
                await adminApi.updateRole(editingRole.id, formData);
                showSuccess('Cập nhật vai trò thành công');
            } else {
                await adminApi.createRole(formData);
                showSuccess('Tạo vai trò thành công');
            }
            setShowModal(false);
            setFormData({ roleName: '', description: '' });
            setEditingRole(null);
            setCurrentPage(0);
            loadRoles();
        } catch (error) {
            showError(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setFormData({ roleName: role.roleName, description: role.description });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        showConfirm(
            'Bạn có chắc muốn xóa vai trò này? Hành động này không thể hoàn tác.',
            async () => {
                try {
                    await adminApi.deleteRole(id);
                    showSuccess('Xóa vai trò thành công');
                    loadRoles();
                } catch (error) {
                    showError('Không thể xóa vai trò');
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

    const handleManagePermissions = async (role) => {
        setSelectedRole(role);
        await loadRolePermissions(role.id);
        setShowPermissionModal(true);
    };

    const handlePermissionChange = (permissionId, isChecked) => {
        if (isChecked) {
            setRolePermissions([...rolePermissions, { id: permissionId }]);
        } else {
            setRolePermissions(rolePermissions.filter(p => p.id !== permissionId));
        }
    };

    const handleSavePermissions = async () => {
        try {
            const permissionIds = rolePermissions.map(p => p.id);
            // Gọi API để cập nhật quyền
            await adminApi.updateRolePermissions(selectedRole.id, permissionIds);
            showSuccess('Đã cập nhật quyền thành công');
            setShowPermissionModal(false);
        } catch (error) {
            showError('Không thể cập nhật quyền');
        }
    };

    if (loading && roles.length === 0) return <div className="loading">Đang tải...</div>;

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>Quản lý Vai trò</h1>
                <button className="btn-primary" onClick={() => { 
                    setShowModal(true); 
                    setEditingRole(null); 
                    setFormData({ roleName: '', description: '' }); 
                }}>
                    <FiPlus /> Thêm vai trò
                </button>
            </div>

            <div className="filter-section">
                <div className="search-bar-compact">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm vai trò..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-info">
                <span>Hiển thị {roles.length > 0 ? currentPage * 10 + 1 : 0} - {Math.min((currentPage + 1) * 10, totalElements)} trong tổng số {totalElements} vai trò</span>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>STT</th>
                            <th>Tên vai trò</th>
                            <th>Mô tả</th>
                            <th>Ngày tạo</th>
                            <th>Cập nhật</th>
                            <th style={{ width: '150px' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Đang tải...</td>
                            </tr>
                        ) : roles.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                    {searchTerm ? 'Không tìm thấy vai trò phù hợp' : 'Chưa có vai trò nào'}
                                </td>
                            </tr>
                        ) : (
                            roles.map((role, index) => {
                                console.log('Role item:', role);
                                return (
                                <tr key={role.id}>
                                    <td>{currentPage * 10 + index + 1}</td>
                                    <td style={{ fontWeight: '600' }}>{role.roleName || '-'}</td>
                                    <td>{role.description}</td>
                                    <td>{role.createdAt ? new Date(role.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                                    <td>{role.updatedAt ? new Date(role.updatedAt).toLocaleDateString('vi-VN') : '-'}</td>
                                    <td>
                                        <div className="dropdown-container" style={{ position: 'relative' }}>
                                            <button 
                                                className="btn-dropdown" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDropdownOpen(dropdownOpen === role.id ? null : role.id);
                                                }}
                                                title="Tùy chọn"
                                            >
                                                <FiMoreVertical />
                                            </button>
                                            {dropdownOpen === role.id && (
                                                <div className="dropdown-menu" style={{ zIndex: 1001 }}>
                                                    <button onClick={() => { handleEdit(role); setDropdownOpen(null); }}>
                                                        <FiEdit2 /> Chỉnh sửa
                                                    </button>
                                                    <button onClick={() => { handleManagePermissions(role); setDropdownOpen(null); }}>
                                                        <FiSettings /> Gán quyền
                                                    </button>
                                                    <button onClick={() => { handleDelete(role.id); setDropdownOpen(null); }} className="delete-option">
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
                        <h2>{editingRole ? 'Cập nhật vai trò' : 'Thêm vai trò mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tên vai trò *</label>
                                <input type="text" value={formData.roleName} onChange={(e) => setFormData({ ...formData, roleName: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-submit">{editingRole ? 'Cập nhật' : 'Tạo mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPermissionModal && selectedRole && (
                <div className="modal-overlay" onClick={() => setShowPermissionModal(false)}>
                    <div className="modal-content permission-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="permission-modal-header">
                            <h2>Gán quyền cho vai trò</h2>
                            <div className="role-info">
                                <span className="role-name">{selectedRole.roleName}</span>
                                {selectedRole.description && (
                                    <span className="role-description">{selectedRole.description}</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="permission-grid">
                            <div className="permission-section">
                                <h3 className="section-title">
                                    <FiCheck className="section-icon" />
                                    Quyền đã gán ({rolePermissions.length})
                                </h3>
                                <div className="permission-list assigned">
                                    {rolePermissions.length === 0 ? (
                                        <div className="empty-state">Chưa có quyền nào được gán</div>
                                    ) : (
                                        rolePermissions.map(permission => {
                                            const fullPermission = permissions.find(p => p.id === permission.id);
                                            return (
                                                <div key={permission.id} className="permission-card assigned">
                                                    <div className="permission-header">
                                                        <span className="permission-name">{fullPermission?.permissionName}</span>
                                                        <button 
                                                            className="remove-btn"
                                                            onClick={() => handlePermissionChange(permission.id, false)}
                                                            title="Bỏ gán quyền"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                    {fullPermission?.description && (
                                                        <div className="permission-description">{fullPermission.description}</div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                            
                            <div className="permission-section">
                                <h3 className="section-title">
                                    <FiPlus className="section-icon" />
                                    Quyền chưa gán ({permissions.filter(p => !rolePermissions.some(rp => rp.id === p.id)).length})
                                </h3>
                                <div className="permission-list available">
                                    {permissions.filter(p => !rolePermissions.some(rp => rp.id === p.id)).length === 0 ? (
                                        <div className="empty-state">Đã gán tất cả quyền</div>
                                    ) : (
                                        permissions
                                            .filter(p => !rolePermissions.some(rp => rp.id === p.id))
                                            .map(permission => (
                                                <div key={permission.id} className="permission-card available">
                                                    <div className="permission-header">
                                                        <span className="permission-name">{permission.permissionName}</span>
                                                        <button 
                                                            className="add-btn"
                                                            onClick={() => handlePermissionChange(permission.id, true)}
                                                            title="Gán quyền"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    {permission.description && (
                                                        <div className="permission-description">{permission.description}</div>
                                                    )}
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={() => setShowPermissionModal(false)}>Hủy</button>
                            <button type="button" className="btn-submit" onClick={handleSavePermissions}>Lưu thay đổi</button>
                        </div>
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

export default RoleManagement;
