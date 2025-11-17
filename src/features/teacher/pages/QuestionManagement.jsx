import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import teacherApi from '../services/teacherApi';
import '../../../styles/features/teacher/Management.css';

const QuestionManagement = () => {
    const [questions, setQuestions] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExam, setSelectedExam] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [showAnswersModal, setShowAnswersModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [viewingAnswers, setViewingAnswers] = useState([]);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [sortOrder, setSortOrder] = useState('desc');
    
    const [formData, setFormData] = useState({
        questionText: '',
        questionType: 'MULTIPLE_CHOICE',
        examId: '',
        answers: [
            { answerText: '', isCorrect: false },
            { answerText: '', isCorrect: false },
            { answerText: '', isCorrect: false },
            { answerText: '', isCorrect: false }
        ]
    });

    useEffect(() => {
        loadExams();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadQuestions();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        loadQuestions();
    }, [selectedExam, selectedType, currentPage, sortOrder]);

    const loadExams = async () => {
        try {
            const examsRes = await teacherApi.getAllExams();
            setExams(examsRes.data || []);
        } catch (error) {
            toast.error('Không thể tải danh sách bộ đề');
        }
    };

    const loadQuestions = useCallback(async () => {
        try {
            setLoading(true);
            const sortParam = `id,${sortOrder}`;
            const examIdParam = selectedExam && selectedExam !== '' ? parseInt(selectedExam) : null;
            const typeParam = selectedType === 'ALL' ? null : selectedType;
            
            const response = await teacherApi.searchQuestions(
                searchTerm,
                examIdParam,
                typeParam,
                currentPage,
                10,
                sortParam
            );
            
            if (response.data) {
                const pageData = response.data;
                setQuestions(pageData.content || []);
                setTotalPages(pageData.totalPages || 0);
                setTotalElements(pageData.totalElements || 0);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            toast.error('Không thể tải danh sách câu hỏi');
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedExam, selectedType, currentPage, sortOrder]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                questionText: formData.questionText,
                questionType: formData.questionType,
                examId: parseInt(formData.examId),
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
            setCurrentPage(0);
            loadQuestions();
        } catch (error) {
            toast.error(editingQuestion ? 'Không thể cập nhật câu hỏi' : 'Không thể tạo câu hỏi');
        }
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(0);
    };

    const handleExamFilter = (value) => {
        setSelectedExam(value);
        setCurrentPage(0);
    };

    const handleTypeFilter = (value) => {
        setSelectedType(value);
        setCurrentPage(0);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleSort = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        setCurrentPage(0);
    };

    const resetForm = () => {
        setFormData({
            questionText: '',
            questionType: 'MULTIPLE_CHOICE',
            examId: '',
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
            examId: question.examId,
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
            loadQuestions();
        } catch (error) {
            console.error('Error deleting question:', error);
            toast.error('Không thể xóa câu hỏi');
        }
    };

    const handleViewAnswers = (question) => {
        setEditingQuestion(question);
        setViewingAnswers(question.answers || []);
        setShowAnswersModal(true);
    };

    const handleEditAnswers = () => {
        if (editingQuestion) {
            setFormData({
                questionText: editingQuestion.questionText,
                questionType: editingQuestion.questionType,
                examId: editingQuestion.examId,
                answers: editingQuestion.answers?.length ? editingQuestion.answers.map(a => ({
                    answerText: a.answerText || a.text || '',
                    isCorrect: a.isCorrect || false,
                    id: a.id
                })) : [
                    { answerText: '', isCorrect: false },
                    { answerText: '', isCorrect: false },
                    { answerText: '', isCorrect: false },
                    { answerText: '', isCorrect: false }
                ]
            });
            setShowAnswersModal(false);
            setShowModal(true);
        }
    };

    const updateAnswer = (index, field, value) => {
        const newAnswers = [...formData.answers];
        newAnswers[index][field] = value;
        setFormData({ ...formData, answers: newAnswers });
    };

    const getRowNumber = (index) => {
        return currentPage * 10 + index + 1;
    };

    const getSortIcon = () => {
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    const getQuestionTypeName = (type) => {
        const types = {
            'MULTIPLE_CHOICE': 'Trắc nghiệm',
            'TRUE_FALSE': 'Đúng/Sai'
        };
        return types[type] || type;
    };

    if (loading && questions.length === 0) return <div className="loading">Đang tải...</div>;

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>Quản lý Câu hỏi</h1>
                <button className="btn-primary" onClick={() => { setShowModal(true); resetForm(); }}>
                    <FiPlus /> Thêm câu hỏi
                </button>
            </div>

            <div className="filter-section">
                <div className="search-bar-compact">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm câu hỏi..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                
                <div className="filter-group">
                    <FiFilter style={{ color: 'var(--primary)' }} />
                    <select 
                        value={selectedExam} 
                        onChange={(e) => handleExamFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Tất cả bộ đề</option>
                        {exams.map(exam => (
                            <option key={exam.id} value={exam.id}>{exam.title}</option>
                        ))}
                    </select>
                    
                    <select 
                        value={selectedType} 
                        onChange={(e) => handleTypeFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="ALL">Tất cả loại</option>
                        <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                        <option value="TRUE_FALSE">Đúng/Sai</option>
                    </select>
                </div>
            </div>

            <div className="table-info">
                <span>Hiển thị {questions.length > 0 ? currentPage * 10 + 1 : 0} - {Math.min((currentPage + 1) * 10, totalElements)} trong tổng số {totalElements} câu hỏi</span>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>STT</th>
                            <th style={{ minWidth: '300px' }}>Câu hỏi</th>
                            <th style={{ width: '120px' }}>Loại</th>
                            <th style={{ width: '150px' }}>Bộ đề</th>
                            <th style={{ width: '100px' }}>Đáp án</th>
                            <th style={{ width: '150px' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div className="spinner-small"></div>
                                    Đang tải...
                                </td>
                            </tr>
                        ) : questions.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                    {searchTerm || selectedExam || selectedType !== 'ALL' 
                                        ? 'Không tìm thấy câu hỏi phù hợp' 
                                        : 'Chưa có câu hỏi nào'}
                                </td>
                            </tr>
                        ) : (
                            questions.map((question, index) => (
                                <tr key={question.id}>
                                    <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                                        {getRowNumber(index)}
                                    </td>
                                    <td style={{ fontWeight: '500' }}>
                                        {question.questionText?.length > 100 
                                            ? question.questionText.substring(0, 100) + '...' 
                                            : question.questionText}
                                    </td>
                                    <td>
                                        <span className="badge-type">{getQuestionTypeName(question.questionType)}</span>
                                    </td>
                                    <td>{exams.find(e => e.id === question.examId)?.title || '-'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="badge-count">{question.answers?.length || 0}</span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-view" 
                                                onClick={() => handleViewAnswers(question)}
                                                title="Xem đáp án"
                                            >
                                                <FiEye />
                                            </button>
                                            <button 
                                                className="btn-edit" 
                                                onClick={() => handleEdit(question)}
                                                title="Sửa"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button 
                                                className="btn-delete" 
                                                onClick={() => handleDelete(question.id)}
                                                title="Xóa"
                                            >
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
                    <div className="modal-content modal-question" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-sticky">
                            <h2>{editingQuestion ? 'Cập nhật câu hỏi' : 'Thêm câu hỏi mới'}</h2>
                            <button 
                                type="button" 
                                className="modal-close-btn" 
                                onClick={() => setShowModal(false)}
                                aria-label="Đóng"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="modal-form-scroll">
                            <div className="form-group">
                                <label>Câu hỏi *</label>
                                <textarea
                                    value={formData.questionText}
                                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                                    required
                                    rows={4}
                                    placeholder="Nhập nội dung câu hỏi..."
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
                                    <label>Bộ đề *</label>
                                    <select
                                        value={formData.examId}
                                        onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
                                        required
                                    >
                                        <option value="">Chọn bộ đề</option>
                                        {exams.map(exam => (
                                            <option key={exam.id} value={exam.id}>{exam.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-group answers-section">
                                <label className="answers-label">
                                    Đáp án (Chọn ít nhất 1 đáp án đúng) *
                                </label>
                                <div className="answers-grid">
                                    {formData.answers.map((answer, index) => (
                                        <div key={index} className="answer-row-improved">
                                            <div className="answer-number">{String.fromCharCode(65 + index)}</div>
                                            <input
                                                type="text"
                                                placeholder={`Nhập đáp án ${String.fromCharCode(65 + index)}`}
                                                value={answer.answerText}
                                                onChange={(e) => updateAnswer(index, 'answerText', e.target.value)}
                                                className="answer-input"
                                            />
                                            <label className="checkbox-label-improved">
                                                <input
                                                    type="checkbox"
                                                    checked={answer.isCorrect}
                                                    onChange={(e) => updateAnswer(index, 'isCorrect', e.target.checked)}
                                                />
                                                <span className="checkbox-text">Đúng</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="modal-actions-sticky">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit" disabled={loading}>
                                    {loading ? 'Đang xử lý...' : (editingQuestion ? 'Cập nhật' : 'Tạo mới')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAnswersModal && (
                <div className="modal-overlay" onClick={() => setShowAnswersModal(false)}>
                    <div className="modal-content modal-answers" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-inline">
                            <h2>Đáp án câu hỏi</h2>
                            <button 
                                type="button" 
                                className="modal-close-btn" 
                                onClick={() => setShowAnswersModal(false)}
                                aria-label="Đóng"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {editingQuestion && (
                            <div className="question-preview">
                                <p className="question-text">{editingQuestion.questionText}</p>
                                <div className="question-meta">
                                    <span className="meta-badge">{getQuestionTypeName(editingQuestion.questionType)}</span>
                                    <span className="meta-badge">{exams.find(e => e.id === editingQuestion.examId)?.title}</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="answers-list-view">
                            {viewingAnswers && viewingAnswers.length > 0 ? (
                                viewingAnswers.map((answer, index) => (
                                    <div key={answer.id || index} className={`answer-item-view ${answer.isCorrect ? 'correct' : ''}`}>
                                        <div className="answer-letter">{String.fromCharCode(65 + index)}</div>
                                        <div className="answer-content">
                                            <span className="answer-text">{answer.answerText || answer.text}</span>
                                            {answer.isCorrect && (
                                                <span className="badge-correct-inline">
                                                    <span className="check-icon">✓</span> Đáp án đúng
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-answers">
                                    <p>Chưa có đáp án nào</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionManagement;
