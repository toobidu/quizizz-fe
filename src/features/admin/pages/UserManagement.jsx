import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiMoreVertical, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import adminApi from '../services/adminApi';
import PopupNotification from '../../../components/PopupNotification';
import { usePopup } from '../../../hooks/usePopup';
import '../../../styles/features/teacher/Management.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ 
        username: '', 
        email: '', 
        password: '', 
        fullName: '', 
        phoneNumber: '', 
        address: '', 
        dob: '', 
        typeAccount: 'PLAYER',
        emailVerified: false 
    });
    const [dropdownOpen, setDropdownOpen] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    const { popup, showSuccess, showError, showConfirm, hidePopup } = usePopup();



    useEffect(() => {
        const timer = setTimeout(() => {
            loadUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        loadUsers();
    }, [currentPage]);

    useEffect(() => {
        const handleClickOutside = () => setDropdownOpen(null);
        if (dropdownOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [dropdownOpen]);



    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await adminApi.searchUsers(searchTerm, currentPage, 10);
            if (response.data) {
                setUsers(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || 0);
            }
        } catch (error) {
            showError('Không thể tải danh sách người dùng');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                const updateData = { ...formData };
                if (!updateData.password) {
                    delete updateData.password;
                }
                await adminApi.updateUser(editingUser.id, updateData);
                showSuccess('Cập nhật người dùng thành công');
            } else {
                await adminApi.createUser(formData);
                showSuccess('Tạo người dùng thành công');
            }
            setShowModal(false);
            setFormData({ 
                username: '', 
                email: '', 
                password: '', 
                fullName: '', 
                phoneNumber: '', 
                address: '', 
                dob: '', 
                typeAccount: 'PLAYER',
                emailVerified: false 
            });
            setEditingUser(null);
            setCurrentPage(0);
            loadUsers();
        } catch (error) {
            showError(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({ 
            username: user.username, 
            email: user.email,
            password: '', // Không hiển thị mật khẩu khi edit
            fullName: user.fullName || '',
            phoneNumber: user.phoneNumber || '',
            address: user.address || '',
            dob: user.dob || '',
            typeAccount: user.typeAccount || 'PLAYER',
            emailVerified: user.emailVerified || false
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        showConfirm(
            'Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác.',
            async () => {
                try {
                    await adminApi.deleteUser(id);
                    showSuccess('Xóa người dùng thành công');
                    loadUsers();
                } catch (error) {
                    showError('Không thể xóa người dùng');
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

    if (loading && users.length === 0) return <div className="loading">Đang tải...</div>;

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>Quản lý Người dùng</h1>
                <button className="btn-primary" onClick={() => { 
                    setShowModal(true); 
                    setEditingUser(null); 
                    setFormData({ 
                        username: '', 
                        email: '', 
                        password: '', 
                        fullName: '', 
                        phoneNumber: '', 
                        address: '', 
                        dob: '', 
                        typeAccount: 'PLAYER',
                        emailVerified: false 
                    }); 
                }}>
                    <FiPlus /> Thêm người dùng
                </button>
            </div>

            <div className="filter-section">
                <div className="search-bar-compact">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-info">
                <span>Hiển thị {users.length > 0 ? currentPage * 10 + 1 : 0} - {Math.min((currentPage + 1) * 10, totalElements)} trong tổng số {totalElements} người dùng</span>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>STT</th>
                            <th>Tên đăng nhập</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Cập nhật</th>
                            <th style={{ width: '100px' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                                    Đang tải...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                                    {searchTerm ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
                                </td>
                            </tr>
                        ) : (
                            users.map((user, index) => (
                                <tr key={user.id}>
                                    <td>{currentPage * 10 + index + 1}</td>
                                    <td style={{ fontWeight: '600' }}>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.typeAccount || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${user.emailVerified ? 'verified' : 'unverified'}`}>
                                            {user.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                                        </span>
                                    </td>
                                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                                    <td>{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('vi-VN') : '-'}</td>
                                    <td>
                                        <div className="dropdown-container" style={{ position: 'relative' }}>
                                            <button 
                                                className="btn-dropdown" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDropdownOpen(dropdownOpen === user.id ? null : user.id);
                                                }}
                                                title="Tùy chọn"
                                            >
                                                <FiMoreVertical />
                                            </button>
                                            {dropdownOpen === user.id && (
                                                <div className="dropdown-menu" style={{ zIndex: 1001 }}>
                                                    <button onClick={() => { handleEdit(user); setDropdownOpen(null); }}>
                                                        <FiEdit2 /> Chỉnh sửa
                                                    </button>
                                                    <button onClick={() => { handleDelete(user.id); setDropdownOpen(null); }} className="delete-option">
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
                    <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        title="Trang trước"
                    >
                        <FiArrowLeft size={18} />
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
                        title="Trang sau"
                    >
                        <FiArrowRight size={18} />
                    </button>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tên đăng nhập *</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Họ tên *</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                    {editingUser && (
                                        <label className="checkbox-label" style={{ marginTop: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.emailVerified}
                                                onChange={(e) => setFormData({ ...formData, emailVerified: e.target.checked })}
                                            />
                                            <span>Email đã xác thực</span>
                                        </label>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Địa chỉ</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ngày sinh</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Vai trò *</label>
                                    <select
                                        value={formData.typeAccount}
                                        onChange={(e) => setFormData({ ...formData, typeAccount: e.target.value })}
                                        required
                                    >
                                        <option value="PLAYER">Người chơi</option>
                                        <option value="TEACHER">Giáo viên</option>
                                        <option value="HOST">Chủ phòng</option>
                                        <option value="ADMIN">Quản trị viên</option>
                                    </select>
                                </div>
                            </div>
                            

                            
                            {!editingUser && (
                                <div className="form-group">
                                    <label>Mật khẩu *</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        placeholder="Tối thiểu 6 ký tự"
                                    />
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-submit">
                                    {editingUser ? 'Cập nhật' : 'Tạo mới'}
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

export default UserManagement;
