import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.connecting = false;
        this.subscriptions = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3; // Giảm từ 5 xuống 3
        this.reconnectInterval = 5000; // Tăng từ 3s lên 5s
        this.connectionPromise = null;
    }

    /**
     * Connect to WebSocket server
     * @param {string} token - JWT token for authentication
     * @returns {Promise<void>}
     */
    connect(token) {
        // Tránh multiple connections
        if (this.connected) {
            return Promise.resolve();
        }

        if (this.connecting) {
            return this.connectionPromise;
        }

        this.connecting = true;
        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                // Cleanup existing client
                if (this.client) {
                    this.client.deactivate();
                }

                this.client = new Client({
                    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
                    connectHeaders: {
                        'Authorization': `Bearer ${token}`
                    },
                    // Tắt auto reconnect của STOMP, tự quản lý
                    reconnectDelay: 0,
                    heartbeatIncoming: 10000,
                    heartbeatOutgoing: 10000
                });

                this.client.onConnect = (frame) => {
                    this.connected = true;
                    this.connecting = false;
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.client.onDisconnect = (frame) => {
                    this.connected = false;
                    this.connecting = false;
                    this.subscriptions.clear();
                };

                this.client.onStompError = (frame) => {
                    this.connected = false;
                    this.connecting = false;
                    reject(new Error(frame.headers.message || 'WebSocket STOMP error'));
                };

                this.client.onWebSocketError = (error) => {
                    this.connected = false;
                    this.connecting = false;

                    // Tự quản lý reconnect thay vì để STOMP tự động
                    this.handleReconnect(token, reject);
                };

                this.client.onWebSocketClose = (event) => {
                    this.connected = false;
                    this.connecting = false;

                    // Chỉ reconnect nếu không phải do lỗi authentication
                    if (event.code !== 1000) { // 1000 = normal closure
                        this.handleReconnect(token, reject);
                    }
                };

                // Timeout để tránh kết nối treo
                const connectTimeout = setTimeout(() => {
                    if (!this.connected) {
                        this.client.deactivate();
                        this.connecting = false;
                        reject(new Error('Connection timeout'));
                    }
                }, 15000); // 15 seconds timeout

                this.client.activate();

                // Clear timeout khi connect thành công
                this.client.onConnect = (frame) => {
                    clearTimeout(connectTimeout);
                    this.connected = true;
                    this.connecting = false;
                    this.reconnectAttempts = 0;
                    resolve();
                };

            } catch (error) {
                this.connecting = false;
                reject(error);
            }
        });

        return this.connectionPromise;
    }

    /**
     * Handle reconnection logic
     * @private
     */
    handleReconnect(token, rejectCallback) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            rejectCallback(new Error('Max reconnection attempts reached'));
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectInterval * this.reconnectAttempts; // Exponential backoff
        setTimeout(() => {
            this.connecting = false; // Reset connecting state
            this.connect(token).catch(rejectCallback);
        }, delay);
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
        this.connected = false;
        this.connecting = false;
        this.connectionPromise = null;
        this.subscriptions.clear();
        this.reconnectAttempts = 0;
    }

    /**
     * Subscribe to a topic
     * @param {string} destination - Topic destination
     * @param {function} callback - Message handler callback
     * @returns {string} - Subscription ID
     */
    subscribe(destination, callback) {
        if (!this.connected || !this.client) {
            throw new Error('WebSocket not connected');
        }

        const subscription = this.client.subscribe(destination, (message) => {
            try {
                const data = JSON.parse(message.body);
                callback(data);
            } catch (error) {

                callback(message.body);
            }
        });

        this.subscriptions.set(destination, subscription);

        return subscription.id;
    }

    /**
     * Unsubscribe from a topic
     * @param {string} destination - Topic destination to unsubscribe
     */
    unsubscribe(destination) {
        const subscription = this.subscriptions.get(destination);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(destination);

        }
    }

    /**
     * Send message to server
     * @param {string} destination - Message destination
     * @param {object} body - Message body
     * @param {object} headers - Additional headers
     */
    send(destination, body = {}, headers = {}) {
        if (!this.connected || !this.client) {
            throw new Error('WebSocket not connected');
        }

        this.client.publish({
            destination,
            body: JSON.stringify(body),
            headers
        });
    }

    /**
     * Check if WebSocket is connected
     * @returns {boolean}
     */
    isConnected() {
        return this.connected;
    }

    /**
     * Get active subscriptions
     * @returns {Array<string>}
     */
    getActiveSubscriptions() {
        return Array.from(this.subscriptions.keys());
    }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
