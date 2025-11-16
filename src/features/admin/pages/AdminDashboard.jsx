import useDocumentTitle from "../../../hooks/useDocumentTitle";
import "../../../styles/pages/Dashboard.css";

const AdminDashboard = () => {
  useDocumentTitle("Admin Dashboard");

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🛠️ Admin Dashboard</h1>
        <p>Quản lý toàn bộ hệ thống</p>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Quản lý người dùng</h3>
              <p>Xem, thêm, sửa, xóa user</p>
              <a href="/admin/users" className="stat-link">Đi tới →</a>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔐</div>
            <div className="stat-info">
              <h3>Quản lý vai trò</h3>
              <p>Phân quyền roles cho user</p>
              <a href="/admin/roles" className="stat-link">Đi tới →</a>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔑</div>
            <div className="stat-info">
              <h3>Quản lý quyền</h3>
              <p>Cấu hình permissions</p>
              <a href="/admin/permissions" className="stat-link">Đi tới →</a>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <h3>Quản lý chủ đề</h3>
              <p>Quản lý topics hệ thống</p>
              <a href="/admin/topics" className="stat-link">Đi tới →</a>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h2>⚠️ Tính năng đang phát triển</h2>
          <p>Các tính năng quản trị sẽ được bổ sung dần:</p>
          <ul>
            <li>✅ Routing và guards đã được thiết lập</li>
            <li>🚧 UI quản lý users (đang phát triển)</li>
            <li>🚧 UI quản lý roles & permissions (đang phát triển)</li>
            <li>🚧 UI quản lý topics (đang phát triển)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
