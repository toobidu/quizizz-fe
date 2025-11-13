import { useState } from 'react';
import { FiX, FiSend, FiLoader, FiCheck, FiEdit2, FiTrash2 } from 'react-icons/fi';
import '../../../styles/features/teacher/AIPromptModal.css';

const AIPromptModal = ({ isOpen, onClose, onConfirm, loading, generatedQuestions, onEdit, onDelete }) => {
    const [prompt, setPrompt] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedQuestion, setEditedQuestion] = useState(null);

    if (!isOpen) return null;

    const handleEdit = (index) => {
        setEditingIndex(index);
        setEditedQuestion({ ...generatedQuestions[index] });
    };

    const handleSaveEdit = () => {
        onEdit(editingIndex, editedQuestion);
        setEditingIndex(null);
        setEditedQuestion(null);
    };

    return (
        <div className="ai-modal-overlay" onClick={onClose}>
            <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="ai-modal-header">
                    <h2>Tạo câu hỏi bằng AI</h2>
                    <button onClick={onClose} className="ai-close-btn">
                        <FiX />
                    </button>
                </div>

                {!generatedQuestions.length ? (
                    <div className="ai-prompt-section">
                        <label>Nhập yêu cầu của bạn:</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ví dụ: Tạo 5 câu hỏi trắc nghiệm về lịch sử Việt Nam thời kỳ Lý-Trần, mỗi câu có 4 đáp án, độ khó trung bình. Câu hỏi cần bao gồm cả sự kiện lịch sử, nhân vật quan trọng và ý nghĩa lịch sử."
                            rows={8}
                            disabled={loading}
                        />
                        <div className="ai-prompt-tips">
                            <strong>💡 Mẹo viết prompt hiệu quả:</strong>
                            <ul>
                                <li>Chỉ rõ số lượng câu hỏi cần tạo</li>
                                <li>Mô tả rõ nội dung, phạm vi kiến thức</li>
                                <li>Nêu rõ độ khó mong muốn</li>
                                <li>Yêu cầu thêm chi tiết về định dạng đáp án</li>
                            </ul>
                        </div>
                        <button
                            onClick={() => onConfirm(prompt)}
                            disabled={!prompt.trim() || loading}
                            className="ai-generate-btn"
                        >
                            {loading ? (
                                <>
                                    <FiLoader className="spin" /> Đang tạo câu hỏi...
                                </>
                            ) : (
                                <>
                                    <FiSend /> Tạo câu hỏi bằng AI
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="ai-results-section">
                        <h3>Câu hỏi đã tạo ({generatedQuestions.length})</h3>
                        <div className="ai-questions-list">
                            {generatedQuestions.map((q, idx) => (
                                <div key={idx} className="ai-question-item">
                                    {editingIndex === idx ? (
                                        <div className="ai-edit-form">
                                            <input
                                                value={editedQuestion.questionText}
                                                onChange={(e) =>
                                                    setEditedQuestion({ ...editedQuestion, questionText: e.target.value })
                                                }
                                            />
                                            {editedQuestion.answers?.map((ans, aIdx) => (
                                                <div key={aIdx} className="ai-answer-edit">
                                                    <input
                                                        value={ans.text}
                                                        onChange={(e) => {
                                                            const newAnswers = [...editedQuestion.answers];
                                                            newAnswers[aIdx].text = e.target.value;
                                                            setEditedQuestion({ ...editedQuestion, answers: newAnswers });
                                                        }}
                                                    />
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={ans.isCorrect}
                                                            onChange={(e) => {
                                                                const newAnswers = [...editedQuestion.answers];
                                                                newAnswers[aIdx].isCorrect = e.target.checked;
                                                                setEditedQuestion({ ...editedQuestion, answers: newAnswers });
                                                            }}
                                                        />
                                                        Đúng
                                                    </label>
                                                </div>
                                            ))}
                                            <button onClick={handleSaveEdit} className="ai-save-btn">
                                                <FiCheck /> Lưu
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="ai-question-content">
                                                <strong>Câu {idx + 1}:</strong> {q.questionText}
                                                <div className="ai-answers">
                                                    {q.answers?.map((ans, aIdx) => (
                                                        <div key={aIdx} className={ans.isCorrect ? 'correct' : ''}>
                                                            {String.fromCharCode(65 + aIdx)}. {ans.text}
                                                            {ans.isCorrect && ' ✓'}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="ai-question-actions">
                                                <button onClick={() => handleEdit(idx)}>
                                                    <FiEdit2 />
                                                </button>
                                                <button onClick={() => onDelete(idx)}>
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="ai-confirm-actions">
                            <button onClick={() => onConfirm(generatedQuestions)} className="ai-confirm-btn">
                                Xác nhận sử dụng
                            </button>
                            <button onClick={onClose} className="ai-cancel-btn">
                                Hủy
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIPromptModal;
