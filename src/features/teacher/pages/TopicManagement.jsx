import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import teacherApi from '../services/teacherApi';
import '../../../styles/features/teacher/Management.css';

const TopicManagement = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        loadTopics();
    }, []);

    const loadTopics = async () => {
        try {
            setLoading(true);
            const response = await teacherApi.getAllTopics();
            setTopics(response.data || []);
        } catch (error) {
            toast.error('Không thể tải danh sách chủ đề');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTopic) {
                await teacherApi.updateTopic(editingTopic.id, formData);
                toast.success('Cập nhật chủ đề thành công');
            } else {
                await teacherApi.createTopic(formData);
                toast.success('Tạo chủ đề thành công');
            }
            setShowModal(false);
            setFormData({ name: '', description: '' });
            setEditingTopic(null);
            loadTopics();
        } catch (error) {
            toast.error(editingTopic ? 'Không thể cập nhật chủ đề' : 'Không thể tạo chủ đề');
        }
    };

    const handleEdit = (topic) => {
        setEditingTopic(topic);
        setFormData({ name: topic.name, description: topic.description });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa chủ đề này?')) return;
        try {
            await teacherApi.deleteTopic(id);
            toast.success('Xóa chủ đề thành công');
            loadTopics();
        } catch (error) {
            toast.error('Không thể xóa chủ đề');
        }
    };

    const filteredTopics = topics.filter(topic =>
        topic.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>Quản lý Chủ đề</h1>
                <button className="btn-primary" onClick={() => { setShowModal(true); setEditingTopic(null); setFormData({ name: '', description: '' }); }}>
                    <FiPlus /> Thêm chủ đề
                </button>
            </div>

            <div className="search-bar">
                <FiSearch />
                <input
                    type="text"
                    placeholder="Tìm kiếm chủ đề..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên chủ đề</th>
                            <th>Mô tả</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTopics.map(topic => (
                            <tr key={topic.id}>
                                <td>{topic.id}</td>
                                <td>{topic.name}</td>
                                <td>{topic.description}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-edit" onClick={() => handleEdit(topic)}>
                                            <FiEdit2 />
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(topic.id)}>
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingTopic ? 'Cập nhật chủ đề' : 'Thêm chủ đề mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tên chủ đề *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-submit">
                                    {editingTopic ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopicManagement;
