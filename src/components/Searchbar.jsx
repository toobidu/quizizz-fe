import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FaExclamationTriangle } from 'react-icons/fa';
import profileApi from '../config/api/profile.api';
import authStore from '../stores/authStore';
import '../style/pages/Profile.css';

function Searchbar({ className = '', placeholder = 'Tìm kiếm người chơi...', onSelectUser }) {
  const navigate = useNavigate();
  const { isAuthenticated } = authStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');

  // Tìm kiếm người dùng với debounce
  useEffect(() => {
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để tìm kiếm');
      setSearchResults([]);
      return;
    }

    const debounceSearch = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          const response = await profileApi.searchUser(searchQuery);
          if (response.isSuccess) {
            setSearchResults(response.data);
            setError('');
          } else {
            setError(response.message);
            setSearchResults([]);
          }
        } catch (err) {
          setError(err.message || 'Lỗi khi tìm kiếm người dùng');
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setError('');
      }
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [searchQuery, isAuthenticated]);

  // Xử lý chọn user từ gợi ý
  const handleSelectUser = useCallback(
    (userId) => {
      setSearchQuery('');
      setSearchResults([]);
      setError('');
      if (onSelectUser) {
        onSelectUser(userId);
      } else {
        navigate(`/profile/${userId}`);
      }
    },
    [navigate, onSelectUser]
  );

  // Xử lý thay đổi input
  const handleInputChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setError('');
  }, []);

  return (
    <div className={`pf-search-bar ${className}`}>
      <FiSearch className="pf-search-icon" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        className="pf-search-input"
      />
      {error && (
        <div className="pf-error-container">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}
      {searchResults.length > 0 && (
        <ul className="pf-search-results">
          {searchResults.map((result) => (
            <li
              key={result.id}
              onClick={() => handleSelectUser(result.id)}
              className="pf-search-item"
            >
              {result.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Searchbar;