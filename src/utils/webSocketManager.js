import websocketService from '../services/websocketService';
import Cookies from 'js-cookie';

/**
 * WebSocket connection manager with proper error handling
 */
class WebSocketManager {
    constructor() {
        this.isInitialized = false;
        this.connectionPromise = null;
    }

    /**
     * Initialize WebSocket connection with proper token management
     */
    async initialize() {
        if (this.isInitialized && websocketService.isConnected()) {
            return;
        }

        if (this.connectionPromise) {
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

            await websocketService.connect(token);
            this.isInitialized = true;
            console.log('✅ WebSocket Manager: Connection established');
        } catch (error) {
            console.warn('⚠️ WebSocket Manager: Connection failed, using REST API mode:', error.message);
            this.connectionPromise = null;
            // Don't throw error, just log and continue in REST API mode
            // throw error;
        }
    }

    /**
     * Get authentication token from storage
     * @private
     */
    _getToken() {
        // Try cookies first
        let token = Cookies.get('accessToken');

        // Fallback to sessionStorage
        if (!token) {
            token = sessionStorage.getItem('accessToken');
        }

        return token;
    }

    /**
     * Disconnect and cleanup
     */
    disconnect() {
        websocketService.disconnect();
        this.isInitialized = false;
        this.connectionPromise = null;
        console.log('🔌 WebSocket Manager: Disconnected');
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.isInitialized && websocketService.isConnected();
    }

    /**
     * Get current user ID from auth store
     */
    getCurrentUserId() {
        try {
            // Dynamic import to avoid circular dependency
            const authStore = require('../stores/authStore').default;
            const user = authStore.getState().user;
            return user?.id;
        } catch (error) {
            console.warn('Failed to get current user ID:', error);
            return null;
        }
    }

    /**
     * Reconnect with fresh token
     */
    async reconnect() {
        this.disconnect();
        return this.initialize();
    }
}

// Singleton instance
const webSocketManager = new WebSocketManager();

export default webSocketManager;