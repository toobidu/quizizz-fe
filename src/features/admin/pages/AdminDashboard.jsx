import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiShield, FiKey, FiBook, FiBarChart2 } from 'react-icons/fi';
import adminApi from '../services/adminApi';
import '../../../styles/features/admin/AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, roles: 0, permissions: 0, topics: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await adminApi.getStatistics();
                setStats(data);
            } catch (error) {
                console.error('Error loading stats:', error);
                setStats({ users: '-', roles: '-', permissions: '-', topics: '-' });
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1>Bảng điều khiển Quản trị</h1>
                <p>Quản lý toàn bộ hệ thống</p>
            </div>

            <div className="admin-content">
                <div className="admin-cards">
                    <Link to="/admin/users" className="admin-card">
                        <div className="admin-card-icon">
                            <FiUsers />
                        </div>
                        <div className="admin-card-content">
                            <h3>Quản lý Người dùng</h3>
                            <p>Xem, thêm, sửa, xóa user</p>
                        </div>
                    </Link>

                    <Link to="/admin/roles" className="admin-card">
                        <div className="admin-card-icon">
                            <FiShield />
                        </div>
                        <div className="admin-card-content">
                            <h3>Quản lý Vai trò</h3>
                            <p>Phân quyền roles cho user</p>
                        </div>
                    </Link>

                    <Link to="/admin/permissions" className="admin-card">
                        <div className="admin-card-icon">
                            <FiKey />
                        </div>
                        <div className="admin-card-content">
                            <h3>Quản lý Quyền</h3>
                            <p>Cấu hình permissions</p>
                        </div>
                    </Link>

                    <Link to="/admin/topics" className="admin-card">
                        <div className="admin-card-icon">
                            <FiBook />
                        </div>
                        <div className="admin-card-content">
                            <h3>Quản lý Chủ đề</h3>
                            <p>Quản lý topics hệ thống</p>
                        </div>
                    </Link>
                </div>

                <div className="admin-sidebar">
                    <div className="sidebar-section">
                        <h3><FiBarChart2 /> Thống kê hệ thống</h3>
                        <div className="quick-stats">
                            <div className="stat-item">
                                <span className="stat-label">Người dùng</span>
                                <span className="stat-value">{loading ? '...' : stats.users}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Vai trò</span>
                                <span className="stat-value">{loading ? '...' : stats.roles}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Quyền</span>
                                <span className="stat-value">{loading ? '...' : stats.permissions}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Chủ đề</span>
                                <span className="stat-value">{loading ? '...' : stats.topics}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
