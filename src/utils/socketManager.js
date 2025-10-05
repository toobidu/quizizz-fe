import socketService from '../services/socketService';
import Cookies from 'js-cookie';

/**
 * WebSocket Connection Manager for Socket.IO
 * Simplified manager that handles initialization and cleanup
 * 
 * NO MORE STOMP/SockJS - Only Socket.IO!
 */
class SocketManager {
    constructor() {
        this.isInitialized = false;
        this.connectionPromise = null;
    }

    /**
     * Initialize Socket.IO connection with proper token management
     * @returns {Promise<void>}
     */
    async initialize() {
        // Already connected
        if (this.isInitialized && socketService.isConnected()) {
            console.log('✅ Socket.IO already initialized and connected');
            return;
        }

        // Connection in progress
        if (this.connectionPromise) {
            console.log('⏳ Socket.IO connection already in progress');
            return this.connectionPromise;
        }

        this.connectionPromise = this._connect();
        return this.connectionPromise;
    }

    /**
     * Private method to handle connection
     * @private
     */
    async _connect() {
        try {
            const token = this._getToken();
            if (!token) {
                throw new Error('Authentication token not found');
            }

            console.log('🔌 Initializing Socket.IO connection...');
            await socketService.connect(token);
            this.isInitialized = true;
            console.log('✅ Socket.IO initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Socket.IO:', error.message);
            this.connectionPromise = null;
            this.isInitialized = false;
            
            // Don't throw error - allow app to work in REST API mode
            // The app can still function without real-time features
        }
    }

    /**
     * Get authentication token from storage
     * @private
     * @returns {string|null}
     */
    _getToken() {
        // Try cookies first
        let token = Cookies.get('accessToken');

        // Fallback to sessionStorage
        if (!token) {
            token = sessionStorage.getItem('accessToken');
        }

        // Fallback to localStorage
        if (!token) {
            token = localStorage.getItem('accessToken');
        }

        return token;
    }

    /**
     * Disconnect and cleanup
     */
    disconnect() {
        console.log('🧹 Cleaning up Socket.IO connection...');
        socketService.disconnect();
        this.isInitialized = false;
        this.connectionPromise = null;
        console.log('✅ Socket.IO cleanup complete');
    }

    /**
     * Check if connected
     * @returns {boolean}
     */
    isConnected() {
        return this.isInitialized && socketService.isConnected();
    }

    /**
     * Get current user ID from auth store
     * @returns {number|null}
     */
    getCurrentUserId() {
        try {
            // Dynamic import to avoid circular dependency
            const authStore = require('../stores/authStore').default;
            const user = authStore.getState().user;
            return user?.id;
        } catch (error) {
            console.warn('⚠️ Could not get current user ID:', error.message);
            return null;
        }
    }

    /**
     * Reconnect with fresh token
     * @returns {Promise<void>}
     */
    async reconnect() {
        console.log('🔄 Reconnecting Socket.IO...');
        this.disconnect();
        return this.initialize();
    }

    /**
     * Get the underlying socket service
     * @returns {SocketService}
     */
    getService() {
        return socketService;
    }
}

// Singleton instance
const socketManager = new SocketManager();

export default socketManager;
