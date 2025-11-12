import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AIPromptModal from '../components/AIPromptModal';
import { useAIGenerator } from '../hooks/useAIGenerator';
import teacherApi from '../services/teacherApi';
import '../../../styles/features/teacher/AIQuestionGenerator.css';

const AIQuestionGenerator = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState('');
    const { loading, generatedQuestions, generateQuestions, setGeneratedQuestions } = useAIGenerator();
    const navigate = useNavigate();

    const handleGenerate = async (prompt) => {
        const result = await generateQuestions(prompt);
        if (!result.success) {
            toast.error('Không thể tạo câu hỏi: ' + result.error);
        }
    };

    const handleConfirm = async (questions) => {
        if (!selectedTopic) {
            toast.error('Vui lòng chọn chủ đề');
            return;
        }

        try {
            for (const q of questions) {
                await teacherApi.createQuestion(selectedTopic, q);
            }
            toast.success(`Đã thêm ${questions.length} câu hỏi`);
            setIsModalOpen(false);
            navigate('/teacher/questions');
        } catch (error) {
            toast.error('Lỗi khi lưu câu hỏi');
        }
    };

    const handleEdit = (index, editedQuestion) => {
        const updated = [...generatedQuestions];
        updated[index] = editedQuestion;
        setGeneratedQuestions(updated);
    };

    const handleDelete = (index) => {
        setGeneratedQuestions(generatedQuestions.filter((_, i) => i !== index));
    };

    return (
        <div className="ai-generator-page">
            <h1>Tạo câu hỏi bằng AI</h1>
            <div className="ai-generator-content">
                <label>Chọn chủ đề:</label>
                <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                    <option value="">-- Chọn chủ đề --</option>
                    {/* Load topics dynamically */}
                </select>
                <button onClick={() => setIsModalOpen(true)} disabled={!selectedTopic}>
                    Mở AI Generator
                </button>
            </div>

            <AIPromptModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={generatedQuestions.length ? handleConfirm : handleGenerate}
                loading={loading}
                generatedQuestions={generatedQuestions}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default AIQuestionGenerator;
