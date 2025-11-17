import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiZap, FiBook, FiFileText } from 'react-icons/fi';
import AIPromptModal from '../components/AIPromptModal';
import { useAIGenerator } from '../hooks/useAIGenerator';
import teacherApi from '../services/teacherApi';
import '../../../styles/features/teacher/AIQuestionGenerator.css';

const AIQuestionGenerator = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [selectedExam, setSelectedExam] = useState('');
    const [topics, setTopics] = useState([]);
    const [exams, setExams] = useState([]);
    const [filteredExams, setFilteredExams] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(true);
    const { loading, generatedQuestions, generateQuestions, setGeneratedQuestions } = useAIGenerator();
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [topicsRes, examsRes] = await Promise.all([
                    teacherApi.getAllTopics(),
                    teacherApi.getAllExams()
                ]);
                setTopics(topicsRes.data || []);
                setExams(examsRes.data || []);
            } catch (error) {
                toast.error('Không thể tải dữ liệu');
            } finally {
                setLoadingTopics(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (selectedTopic) {
            setFilteredExams(exams.filter(e => e.topicId === parseInt(selectedTopic)));
            setSelectedExam('');
        } else {
            setFilteredExams(exams);
        }
    }, [selectedTopic, exams]);

    const handleGenerate = async (prompt) => {
        if (!selectedExam) {
            toast.error('Vui lòng chọn bộ đề trước');
            return;
        }
        
        const result = await generateQuestions(selectedExam, prompt);
        
        if (result.success) {
            toast.success(`${result.message || `Đã tạo ${result.totalGenerated} câu hỏi thành công!`}`);
        } else {
            toast.error('Không thể tạo câu hỏi: ' + result.error);
        }
    };

    const handleConfirm = () => {
        toast.success(`Đã lưu ${generatedQuestions.length} câu hỏi thành công!`);
        setIsModalOpen(false);
        setGeneratedQuestions([]);
        navigate('/teacher/questions');
    };

    const handleEdit = (index, editedQuestion) => {
        const updated = [...generatedQuestions];
        updated[index] = editedQuestion;
        setGeneratedQuestions(updated);
    };

    const handleDelete = (index) => {
        const updated = generatedQuestions.filter((_, i) => i !== index);
        setGeneratedQuestions(updated);
        toast.info(`Đã xóa câu hỏi. Còn lại ${updated.length} câu hỏi.`);
    };

    // Prompt examples
    const promptExamples = [
        {
            icon: <FiBook />,
            title: 'Trắc nghiệm cơ bản',
            text: 'Tạo 5 câu hỏi trắc nghiệm về [tên bộ đề], mỗi câu có 4 đáp án, độ khó trung bình'
        },
        {
            icon: <FiBook />,
            title: 'Câu hỏi nâng cao',
            text: 'Tạo 10 câu hỏi về [tên bộ đề] với độ khó cao, bao gồm cả câu hỏi tình huống và phân tích'
        },
        {
            icon: <FiZap />,
            title: 'Đa dạng định dạng',
            text: 'Tạo 8 câu hỏi về [tên bộ đề], bao gồm: 4 câu trắc nghiệm, 2 câu đúng/sai, 2 câu nhiều đáp án đúng'
        }
    ];

    const handleUseExample = (exampleText) => {
        if (!selectedExam) {
            toast.warning('Vui lòng chọn bộ đề trước');
            return;
        }
        
        const topicName = topics.find(t => t.id === parseInt(selectedTopic))?.name || 'chủ đề';
        const filledText = exampleText.replace('[chủ đề]', topicName);
        
        navigator.clipboard.writeText(filledText);
        toast.success('Đã copy mẫu prompt!');
        setIsModalOpen(true);
    };

    return (
        <div className="ai-generator-page">
            <div className="ai-page-header">
                <div>
                    <h1><FiZap /> Tạo câu hỏi bằng AI</h1>
                    <p className="ai-subtitle">Sử dụng AI để tự động tạo câu hỏi trắc nghiệm chất lượng cao</p>
                </div>
            </div>

            <div className="ai-generator-content">
                <div className="ai-selection-row">
                    <div className="ai-topic-selection">
                        <label>
                            <FiBook /> Chọn chủ đề:
                        </label>
                        <select 
                            value={selectedTopic} 
                            onChange={(e) => setSelectedTopic(e.target.value)}
                            disabled={loadingTopics}
                        >
                            <option value="">-- Chọn chủ đề --</option>
                            {topics.map(topic => (
                                <option key={topic.id} value={topic.id}>{topic.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedTopic && (
                        <div className="ai-topic-selection">
                            <label>
                                <FiFileText /> Chọn bộ đề:
                            </label>
                            <select 
                                value={selectedExam} 
                                onChange={(e) => {
                                    setSelectedExam(e.target.value);
                                    if (e.target.value) {
                                        const exam = filteredExams.find(e => e.id === parseInt(e.target.value));
                                        toast.success(`Đã chọn bộ đề: ${exam?.title || ''}`);
                                    }
                                }}
                                className={filteredExams.length === 0 ? 'empty' : ''}
                            >
                                <option value="">
                                    {filteredExams.length === 0 ? 'Chưa có bộ đề nào' : '-- Chọn bộ đề --'}
                                </option>
                                {filteredExams.map(exam => (
                                    <option key={exam.id} value={exam.id}>{exam.title}</option>
                                ))}
                            </select>
                            {filteredExams.length === 0 && (
                                <div className="topic-warning">
                                    <span>Chủ đề này chưa có bộ đề nào.</span>
                                    <button 
                                        onClick={() => navigate('/teacher/exams')}
                                        className="btn-create-topic"
                                    >
                                        Tạo bộ đề ngay
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="ai-prompt-suggestions">
                    <h3><FiBook /> Gợi ý mẫu Prompt</h3>
                    <p className="suggestions-desc">Chọn một mẫu prompt bên dưới để bắt đầu nhanh chóng:</p>
                    
                    <div className="prompt-examples-grid">
                        {promptExamples.map((example, index) => (
                            <div key={index} className="prompt-example-card">
                                <div className="example-icon">{example.icon}</div>
                                <h4>{example.title}</h4>
                                <p>{example.text}</p>
                                <button 
                                    onClick={() => handleUseExample(example.text)}
                                    disabled={!selectedExam}
                                    className="btn-use-example"
                                >
                                    Sử dụng mẫu này
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="ai-action-section">
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        disabled={!selectedExam}
                        className="btn-open-ai"
                    >
                        <FiZap /> Mở AI Generator
                    </button>
                    {!selectedExam && (
                        <p className="ai-hint">Vui lòng chọn bộ đề trước khi tạo câu hỏi</p>
                    )}
                </div>
            </div>

            <AIPromptModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setGeneratedQuestions([]);
                }}
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
