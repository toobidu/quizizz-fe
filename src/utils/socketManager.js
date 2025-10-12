import socketService from '../services/socketService';
import Cookies from 'js-cookie';

/**
 * Trình quản lý kết nối WebSocket cho Socket.IO
 *
 */
class SocketManager {
    constructor() {
        this.isInitialized = false;
        this.connectionPromise = null;
    }

    /**
     * Khởi tạo kết nối Socket.IO với quản lý token đúng cách
     * @returns {Promise<void>}
     */
    async initialize() {
        // Đã kết nối
        if (this.isInitialized && socketService.isConnected()) {
            return;
        }

        // Đang kết nối
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = this._connect();
        return this.connectionPromise;
    }

    /**
     * Phương thức riêng tư để xử lý kết nối
     * @private
     */
    async _connect() {
        try {
            const token = this._getToken();
            if (!token) {
                throw new Error('Authentication token not found');
            }

            await socketService.connect(token);
            this.isInitialized = true;
        } catch (error) {
            this.connectionPromise = null;
            this.isInitialized = false;

            // Không ném lỗi - cho phép ứng dụng hoạt động ở chế độ REST API
            // Ứng dụng vẫn có thể hoạt động mà không có tính năng real-time
        }
    }

    /**
     * Lấy token xác thực từ bộ nhớ
     * @private
     * @returns {string|null}
     */
    _getToken() {
        // Thử cookies trước
        let token = Cookies.get('accessToken');

        // Fallback sang sessionStorage
        if (!token) {
            token = sessionStorage.getItem('accessToken');
        }

        // Fallback sang localStorage
        if (!token) {
            token = localStorage.getItem('accessToken');
        }

        return token;
    }

    /**
     * Ngắt kết nối và dọn dẹp
     */
    disconnect() {
        socketService.disconnect();
        this.isInitialized = false;
        this.connectionPromise = null;
    }

    /**
     * Kiểm tra xem có kết nối không
     * @returns {boolean}
     */
    isConnected() {
        return this.isInitialized && socketService.isConnected();
    }

    /**
     * Lấy ID người dùng hiện tại từ auth store
     * @returns {number|null}
     */
    getCurrentUserId() {
        try {
            // Import động để tránh phụ thuộc vòng tròn
            const authStore = require('../stores/authStore').default;
            const user = authStore.getState().user;
            return user?.id;
        } catch (error) {
            return null;
        }
    }

    /**
     * Thực thi callback một lần khi socket đã kết nối
     * @param {Function} callback - Hàm cần thực thi
     * @returns {Promise<void>}
     */
    async onceConnected(callback) {
        await this.initialize();
        if (this.isConnected()) {
            callback();
        } else {
        }
    }

    /**
     * Kết nối lại với token mới
     * @returns {Promise<void>}
     */
    async reconnect() {
        this.disconnect();
        return this.initialize();
    }

    /**
     * Lấy service socket cơ bản
     * @returns {SocketService}
     */
    getService() {
        return socketService;
    }
}

// Singleton instance
const socketManager = new SocketManager();

export default socketManager;
