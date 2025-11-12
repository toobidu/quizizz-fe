import { Link } from 'react-router-dom';
import { FiBook, FiHelpCircle, FiBarChart2, FiCpu } from 'react-icons/fi';
import '../../../styles/features/teacher/TeacherDashboard.css';

const TeacherDashboard = () => {
    return (
        <div className="teacher-dashboard">
            <div className="teacher-header">
                <h1>Bảng điều khiển Giáo viên</h1>
                <p>Quản lý chủ đề, câu hỏi và theo dõi thống kê</p>
            </div>

            <div className="teacher-cards">
                <Link to="/teacher/topics" className="teacher-card">
                    <div className="card-icon">
                        <FiBook />
                    </div>
                    <h3>Quản lý Chủ đề</h3>
                    <p>Tạo, sửa, xóa các chủ đề câu hỏi</p>
                </Link>

                <Link to="/teacher/questions" className="teacher-card">
                    <div className="card-icon">
                        <FiHelpCircle />
                    </div>
                    <h3>Quản lý Câu hỏi</h3>
                    <p>Quản lý câu hỏi và đáp án</p>
                </Link>

                <Link to="/teacher/ai-generator" className="teacher-card">
                    <div className="card-icon">
                        <FiCpu />
                    </div>
                    <h3>Tạo câu hỏi AI</h3>
                    <p>Sử dụng AI để tạo câu hỏi tự động</p>
                </Link>

                <Link to="/teacher/statistics" className="teacher-card">
                    <div className="card-icon">
                        <FiBarChart2 />
                    </div>
                    <h3>Thống kê</h3>
                    <p>Xem thống kê người chơi và câu hỏi</p>
                </Link>
            </div>
        </div>
    );
};

export default TeacherDashboard;
