import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import teacherApi from '../services/teacherApi';
import '../../../styles/features/teacher/Management.css';

const QuestionManagement = () => {
    const [questions, setQuestions] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showAnswersModal, setShowAnswersModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [viewingAnswers, setViewingAnswers] = useState([]);
    const [formData, setFormData] = useState({
        questionText: '',
        questionType: 'MULTIPLE_CHOICE',
        topicId: '',
        answers: [
            { answerText: '', isCorrect: false },
            { answerText: '', isCorrect: false },
            { answerText: '', isCorrect: false },
            { answerText: '', isCorrect: false }
        ]
    });

    useEffect(() => {
        loadData();
    }, [selectedTopic]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [topicsRes, questionsRes] = await Promise.all([
                teacherApi.getAllTopics(),
                selectedTopic ? teacherApi.getQuestionsByTopic(selectedTopic) : Promise.resolve({ data: [] })
            ]);
            setTopics(topicsRes.data || []);
            setQuestions(questionsRes.data || []);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                questionText: formData.questionText,
                questionType: formData.questionType,
                topicId: parseInt(formData.topicId),
                answers: formData.answers.filter(a => a.answerText.trim())
            };

            if (editingQuestion) {
                await teacherApi.updateQuestion(editingQuestion.id, payload);
                toast.success('Cập nhật câu hỏi thành công');
            } else {
                await teacherApi.createQuestion(payload);
                toast.success('Tạo câu hỏi thành công');
            }
            setShowModal(false);
            resetForm();
            loadData();
        } catch (error) {
            toast.error(editingQuestion ? 'Không thể cập nhật câu hỏi' : 'Không thể tạo câu hỏi');
        }
    };

    const resetForm = () => {
        setFormData({
            questionText: '',
            questionType: 'MULTIPLE_CHOICE',
            topicId: '',
            answers: [
                { answerText: '', isCorrect: false },
                { answerText: '', isCorrect: false },
                { answerText: '', isCorrect: false },
                { answerText: '', isCorrect: false }
            ]
        });
        setEditingQuestion(null);
    };

    const handleEdit = (question) => {
        setEditingQuestion(question);
        setFormData({
            questionText: question.questionText,
            questionType: question.questionType,
            topicId: question.topicId,
            answers: question.answers?.length ? question.answers : [
                { answerText: '', isCorrect: false },
                { answerText: '', isCorrect: false },
                { answerText: '', isCorrect: false },
                { answerText: '', isCorrect: false }
            ]
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
        try {
            await teacherApi.deleteQuestion(id);
            toast.success('Xóa câu hỏi thành công');
            loadData();
        } catch (error) {
            toast.error('Không thể xóa câu hỏi');
        }
    };

    const handleViewAnswers = async (question) => {
        try {
            const response = await teacherApi.getAnswersByQuestion(question.id);
            setViewingAnswers(response.data || []);
            setShowAnswersModal(true);
        } catch (error) {
            toast.error('Không thể tải đáp án');
        }
    };

    const updateAnswer = (index, field, value) => {
        const newAnswers = [...formData.answers];
        newAnswers[index][field] = value;
        setFormData({ ...formData, answers: newAnswers });
    };

    const filteredQuestions = questions.filter(q =>
        q.questionText?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>Quản lý Câu hỏi</h1>
                <button className="btn-primary" onClick={() => { setShowModal(true); resetForm(); }}>
                    <FiPlus /> Thêm câu hỏi
                </button>
            </div>

            <div className="filters">
                <div className="search-bar">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm câu hỏi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                    <option value="">Tất cả chủ đề</option>
                    {topics.map(topic => (
                        <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                </select>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Câu hỏi</th>
                            <th>Loại</th>
                            <th>Chủ đề</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredQuestions.map(question => (
                            <tr key={question.id}>
                                <td>{question.id}</td>
                                <td>{question.questionText}</td>
                                <td>{question.questionType}</td>
                                <td>{topics.find(t => t.id === question.topicId)?.name}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-view" onClick={() => handleViewAnswers(question)}>
                                            <FiEye />
                                        </button>
                                        <button className="btn-edit" onClick={() => handleEdit(question)}>
                                            <FiEdit2 />
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(question.id)}>
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
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingQuestion ? 'Cập nhật câu hỏi' : 'Thêm câu hỏi mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Câu hỏi *</label>
                                <textarea
                                    value={formData.questionText}
                                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                                    required
                                    rows={3}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Loại câu hỏi *</label>
                                    <select
                                        value={formData.questionType}
                                        onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                                        required
                                    >
                                        <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                                        <option value="TRUE_FALSE">Đúng/Sai</option>
                                    </select>
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
                            </div>
                            <div className="form-group">
                                <label>Đáp án</label>
                                {formData.answers.map((answer, index) => (
                                    <div key={index} className="answer-row">
                                        <input
                                            type="text"
                                            placeholder={`Đáp án ${index + 1}`}
                                            value={answer.answerText}
                                            onChange={(e) => updateAnswer(index, 'answerText', e.target.value)}
                                        />
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={answer.isCorrect}
                                                onChange={(e) => updateAnswer(index, 'isCorrect', e.target.checked)}
                                            />
                                            Đúng
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-submit">
                                    {editingQuestion ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAnswersModal && (
                <div className="modal-overlay" onClick={() => setShowAnswersModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Đáp án</h2>
                        <div className="answers-list">
                            {viewingAnswers.map((answer, index) => (
                                <div key={answer.id} className={`answer-item ${answer.isCorrect ? 'correct' : ''}`}>
                                    <span>{String.fromCharCode(65 + index)}. {answer.answerText}</span>
                                    {answer.isCorrect && <span className="badge-correct">✓ Đúng</span>}
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowAnswersModal(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionManagement;
