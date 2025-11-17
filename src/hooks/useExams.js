import { useState, useEffect, useCallback } from 'react';
import examApi from '../services/examApi';

/**
 * Custom hook để quản lý Exams
 * @param {number} topicId - Topic ID to filter exams (optional)
 * @param {boolean} autoLoad - Auto load on mount (default: true)
 */
const useExams = (topicId = null, autoLoad = true) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load exams
   */
  const loadExams = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (topicId) {
        result = await examApi.getExamsByTopicId(topicId);
      } else {
        result = await examApi.getAllExams();
      }

      if (result.success) {
        setExams(result.data || []);
      } else {
        setError(result.error || 'Không thể tải danh sách bộ đề');
        setExams([]);
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải bộ đề');
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  /**
   * Reload exams
   */
  const refreshExams = useCallback(() => {
    loadExams();
  }, [loadExams]);

  /**
   * Get exam by ID
   */
  const getExamById = useCallback((examId) => {
    return exams.find(exam => exam.id === examId);
  }, [exams]);

  /**
   * Search exams locally
   */
  const searchExams = useCallback((keyword) => {
    if (!keyword) return exams;
    
    const lowerKeyword = keyword.toLowerCase();
    return exams.filter(exam => 
      exam.title?.toLowerCase().includes(lowerKeyword) ||
      exam.description?.toLowerCase().includes(lowerKeyword)
    );
  }, [exams]);

  // Auto load on mount or when topicId changes
  useEffect(() => {
    if (autoLoad) {
      loadExams();
    }
  }, [topicId, autoLoad, loadExams]);

  return {
    exams,
    loading,
    error,
    loadExams,
    refreshExams,
    getExamById,
    searchExams,
    hasExams: exams.length > 0
  };
};

export default useExams;
