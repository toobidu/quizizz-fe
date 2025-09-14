// Utility functions for Profile component

export const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Chưa cập nhật';

        // Format với số 0 cho ngày và tháng
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    } catch {
        return 'Chưa cập nhật';
    }
};

export const getFieldValue = (data, fieldName) => data?.[fieldName] || 'Chưa cập nhật';

export const getAvatarUrl = (avatarURL) => {
    if (!avatarURL) return '';

    // Nếu là full URL (http/https), trả về nguyên
    if (avatarURL.startsWith('http://') || avatarURL.startsWith('https://')) {
        return avatarURL;
    }

    // Backend URL - thay đổi theo cấu hình thực tế
    const BACKEND_URL = 'http://localhost:8080';

    // Nếu avatarURL chỉ là filename, tạo full URL
    if (!avatarURL.includes('/')) {
        return `${BACKEND_URL}/api/v1/profile/avatar/${avatarURL}`;
    }

    // Nếu đã có path, chỉ cần thêm base URL
    return `${BACKEND_URL}${avatarURL.startsWith('/') ? '' : '/'}${avatarURL}`;
};