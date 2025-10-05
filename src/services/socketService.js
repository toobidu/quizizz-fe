import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

/**
 * Socket.IO Service for Real-time Game Communication
 * Standardized for Kahoot/Quizizz-like architecture
 * 
 * This is the ONLY WebSocket service - no more STOMP/SockJS confusion!
 */
class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.listeners = new Map();
        this.rooms = new Set(); // Track joined rooms
    }

    /**
     * Connect to Socket.IO server
     * @param {string} token - JWT token for authentication (optional if in cookie)
     * @returns {Promise<void>}
     */
    connect(token = null) {
        return new Promise((resolve, reject) => {
            if (this.connected && this.socket) {
                console.log('✅ Socket.IO already connected');
                return resolve();
            }

            // Get token from parameter or cookie
            const authToken = token || Cookies.get('accessToken');
            if (!authToken) {
                console.error('❌ No authentication token found');
                return reject(new Error('No authentication token found'));
            }

            console.log('🔌 Connecting to Socket.IO server...');

            // Socket.IO configuration
            this.socket = io('http://localhost:9092', {
                transports: ['websocket', 'polling'],
                auth: {
                    token: authToken
                },
                query: {
                    token: authToken
                },
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
            });

            // Connection successful
            this.socket.on('connect', () => {
                this.connected = true;
                this.reconnectAttempts = 0;
                console.log('✅ Socket.IO connected:', this.socket.id);
                resolve();
            });

            // Disconnection
            this.socket.on('disconnect', (reason) => {
                this.connected = false;
                console.log('⚠️ Socket.IO disconnected:', reason);

                if (reason === 'io server disconnect') {
                    // Server disconnected, manual reconnect needed
                    this.socket.connect();
                }
            });

            // Connection error
            this.socket.on('connect_error', (error) => {
                this.reconnectAttempts++;
                console.error(`❌ Socket.IO connection error (attempt ${this.reconnectAttempts}):`, error.message);

                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    reject(new Error('Failed to connect after maximum attempts'));
                }
            });

            // Generic error
            this.socket.on('error', (error) => {
                console.error('❌ Socket.IO error:', error);
            });

            // Auto-reconnect successful
            this.socket.on('reconnect', (attemptNumber) => {
                this.connected = true;
                this.reconnectAttempts = 0;
                console.log('✅ Socket.IO reconnected after', attemptNumber, 'attempts');
            });

            // Reconnect attempt
            this.socket.on('reconnect_attempt', (attemptNumber) => {
                console.log('🔄 Socket.IO reconnect attempt', attemptNumber);
            });

            // Reconnect failed
            this.socket.on('reconnect_failed', () => {
                console.error('❌ Socket.IO reconnection failed');
                reject(new Error('Reconnection failed'));
            });
        });
    }

    /**
     * Disconnect from Socket.IO server
     */
    disconnect() {
        if (this.socket) {
            console.log('👋 Disconnecting Socket.IO...');
            
            // Leave all rooms before disconnect
            this.rooms.forEach(room => {
                this.leaveRoom(room);
            });
            
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
            this.listeners.clear();
            this.rooms.clear();
            
            console.log('✅ Socket.IO disconnected');
        }
    }

    /**
     * Emit an event to the server
     * @param {string} event - Event name
     * @param {*} data - Data to send
     * @param {Function} callback - Optional acknowledgment callback
     */
    emit(event, data, callback) {
        if (!this.socket || !this.connected) {
            console.warn('⚠️ Cannot emit, Socket.IO not connected');
            return;
        }

        if (callback) {
            this.socket.emit(event, data, callback);
        } else {
            this.socket.emit(event, data);
        }
    }

    /**
     * Listen to an event from the server
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.socket) {
            console.warn('⚠️ Cannot listen, Socket.IO not initialized');
            return;
        }

        this.socket.on(event, (data) => {
            callback(data);
        });

        // Store listener reference for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove listener for an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove (optional)
     */
    off(event, callback) {
        if (!this.socket) return;

        if (callback) {
            this.socket.off(event, callback);
        } else {
            this.socket.off(event);
        }

        // Clean up stored references
        if (this.listeners.has(event)) {
            if (callback) {
                const callbacks = this.listeners.get(event);
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            } else {
                this.listeners.delete(event);
            }
        }
    }

    /**
     * Listen to an event only once
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    once(event, callback) {
        if (!this.socket) {
            console.warn('⚠️ Cannot listen, Socket.IO not initialized');
            return;
        }

        this.socket.once(event, (data) => {
            callback(data);
        });
    }

    /**
     * Join a room
     * @param {string|number} roomId - Room ID to join
     * @param {Function} callback - Optional acknowledgment callback
     */
    joinRoom(roomId, callback) {
        if (!this.socket || !this.connected) {
            console.warn('⚠️ Cannot join room, Socket.IO not connected');
            return;
        }

        console.log('🚪 Joining room:', roomId);
        this.rooms.add(roomId);
        
        this.emit('joinRoom', { roomId }, (response) => {
            if (response?.success) {
                console.log('✅ Joined room:', roomId);
            } else {
                console.error('❌ Failed to join room:', response?.error);
            }
            callback?.(response);
        });
    }

    /**
     * Leave a room
     * @param {string|number} roomId - Room ID to leave
     * @param {Function} callback - Optional acknowledgment callback
     */
    leaveRoom(roomId, callback) {
        if (!this.socket || !this.connected) {
            console.warn('⚠️ Cannot leave room, Socket.IO not connected');
            return;
        }

        console.log('🚪 Leaving room:', roomId);
        this.rooms.delete(roomId);
        
        this.emit('leaveRoom', { roomId }, (response) => {
            if (response?.success) {
                console.log('✅ Left room:', roomId);
            } else {
                console.error('❌ Failed to leave room:', response?.error);
            }
            callback?.(response);
        });
    }

    /**
     * Subscribe to room list updates (for dashboard)
     */
    subscribeToRoomList(callback) {
        console.log('📋 Subscribing to room list updates');
        this.on('roomCreated', (data) => {
            callback({ type: 'CREATE_ROOM', data });
        });
        
        this.on('roomDeleted', (data) => {
            callback({ type: 'ROOM_DELETED', data });
        });
        
        this.on('roomUpdated', (data) => {
            callback({ type: 'ROOM_UPDATED', data });
        });
    }

    /**
     * Unsubscribe from room list updates
     */
    unsubscribeFromRoomList() {
        console.log('📋 Unsubscribing from room list updates');
        this.off('roomCreated');
        this.off('roomDeleted');
        this.off('roomUpdated');
    }

    /**
     * Subscribe to room-specific events
     * Match backend event names: player-joined, player-left, game-started, etc.
     * @param {string|number} roomId - Room ID
     * @param {Function} callback - Callback for room events
     */
    subscribeToRoom(roomId, callback) {
        console.log('📡 Subscribing to room events:', roomId);
        
        // Room-specific events matching backend
        this.on('player-joined', (data) => {
            // Only handle events for this room
            if (data.room?.id === roomId || data.roomId === roomId) {
                callback({ type: 'JOIN_ROOM', data });
            }
        });
        
        this.on('player-left', (data) => {
            if (data.roomId === roomId) {
                callback({ type: 'LEAVE_ROOM', data });
            }
        });
        
        this.on('game-started', (data) => {
            if (data.roomId === roomId) {
                callback({ type: 'GAME_STARTED', data });
            }
        });
        
        this.on('player-kicked', (data) => {
            if (data.roomId === roomId) {
                callback({ type: 'PLAYER_KICKED', data });
            }
        });
        
        this.on('question-started', (data) => {
            if (data.roomId === roomId) {
                callback({ type: 'QUESTION_STARTED', data });
            }
        });
        
        this.on('answer-submitted', (data) => {
            if (data.roomId === roomId) {
                callback({ type: 'ANSWER_SUBMITTED', data });
            }
        });
        
        this.on('next-question', (data) => {
            if (data.roomId === roomId) {
                callback({ type: 'QUESTION_ENDED', data });
            }
        });
        
        this.on('game-ended', (data) => {
            if (data.roomId === roomId) {
                callback({ type: 'GAME_ENDED', data });
            }
        });
        
        // Store room ID for cleanup
        this._subscribedRoomId = roomId;
    }

    /**
     * Unsubscribe from room-specific events
     * @param {string|number} roomId - Room ID
     */
    unsubscribeFromRoom(roomId) {
        console.log('📡 Unsubscribing from room events:', roomId);
        this.off('player-joined');
        this.off('player-left');
        this.off('game-started');
        this.off('player-kicked');
        this.off('question-started');
        this.off('answer-submitted');
        this.off('next-question');
        this.off('game-ended');
        this._subscribedRoomId = null;
    }

    /**
     * Get socket connection status
     * @returns {boolean}
     */
    isConnected() {
        return this.connected && this.socket?.connected;
    }

    /**
     * Get socket ID
     * @returns {string|null}
     */
    getSocketId() {
        return this.socket?.id || null;
    }

    /**
     * Get list of joined rooms
     * @returns {Set}
     */
    getJoinedRooms() {
        return new Set(this.rooms);
    }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
