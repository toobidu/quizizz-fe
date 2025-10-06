import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.listeners = new Map();
        this.rooms = new Set();
    }

    /**
     * Connect to Socket.IO server
     * @param {string} token - JWT token for authentication (optional if in cookie)
     * @returns {Promise<void>}
     */
    connect(token = null) {
        return new Promise((resolve, reject) => {
            if (this.connected && this.socket) {
                console.log('🔗 Already connected to Socket.IO');
                return resolve();
            }

            if (this.socket) {
                console.log('🔄 Disconnecting existing connection...');
                this.disconnect();
            }

            const authToken = token || Cookies.get('accessToken');
            if (!authToken) {
                console.error('❌ No authentication token found');
                return reject(new Error('No authentication token found'));
            }

            console.log('🚀 Connecting to Socket.IO server...');
            this.socket = io('http://localhost:9092', {
                transports: ['websocket', 'polling'],
                auth: { token: authToken },
                query: { token: authToken },
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                forceNew: true,
            });

            this.socket.on('connect', () => {
                console.log('🔗 Socket.IO connected with ID:', this.socket.id);
                this.connected = true;
                this.reconnectAttempts = 0;
                this._setupGlobalListeners();

                // Re-subscribe to room-list broadcasts if previously subscribed
                if (this._subscribedRoomList) {
                    try {
                        this.emit('subscribe-room-list');
                        console.log('📋 Resubscribed to room-list broadcasts');
                    } catch {}
                }

                // Khôi phục trạng thái phòng khi reconnect
                this.rooms.forEach(roomId => {
                    this.joinRoom(roomId, (response) => {
                        console.log(`🔄 Rejoined room ${roomId}:`, response);
                    });
                });

                resolve();
            });

            this.socket.on('connect_error', (error) => {
                console.error('❌ Socket.IO connection error:', error);
                this.reconnectAttempts++;
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    reject(new Error('Failed to connect after maximum attempts'));
                }
            });

            this.socket.on('error', (error) => {
                console.error('❌ Socket.IO error:', error);
            });

            this.socket.on('reconnect', (attemptNumber) => {
                this.connected = true;
                this.reconnectAttempts = 0;
                console.log('🔗 Reconnected after', attemptNumber, 'attempts');
            });

            this.socket.on('reconnect_failed', () => {
                reject(new Error('Reconnection failed'));
            });
        });
    }

    _setupGlobalListeners() {
        console.log('🔧 Setting up global listeners...');

        // Xóa tất cả listener hiện tại để tránh trùng lặp
        this.listeners.forEach((callbacks, event) => {
            callbacks.forEach(callback => this.socket.off(event, callback));
        });
        this.listeners.clear();

        this.socket.onAny((eventName, ...args) => {
            console.log('📡 Received any event:', eventName, args);
        });

        this.on('roomCreated', (data) => {
            console.log('🎯 Received roomCreated event:', data);
            if (this._onRoomCreated) this._onRoomCreated(data);
        });

        this.on('roomDeleted', (data) => {
            console.log('🎯 Received roomDeleted event:', data);
            if (this._onRoomDeleted) this._onRoomDeleted(data);
        });

        this.on('roomUpdated', (data) => {
            console.log('🎯 Received roomUpdated event:', data);
            if (this._onRoomUpdated) this._onRoomUpdated(data);
        });

        this.on('connection-confirmed', (data) => {
            console.log('✅ Connection confirmed by backend:', data);
        });

        this.on('subscription-confirmed', (data) => {
            console.log('📋 Subscription confirmed:', data);
        });

        this.on('join-room-success', (data) => {
            console.log('✅ Join room success:', data);
        });

        this.on('join-room-error', (data) => {
            console.error('❌ Join room error:', data);
        });

        this.on('start-game-success', (data) => {
            console.log('✅ Start game success:', data);
        });

        this.on('start-game-error', (data) => {
            console.error('❌ Start game error:', data);
        });
    }

    // ✅ Thêm các hàm lưu callback để dùng lại khi reconnect
    setOnRoomCreated(callback) {
        console.log('📝 Setting onRoomCreated callback:', !!callback);
        this._onRoomCreated = callback;
    }

    setOnRoomDeleted(callback) {
        console.log('📝 Setting onRoomDeleted callback:', !!callback);
        this._onRoomDeleted = callback;
    }

    setOnRoomUpdated(callback) {
        console.log('📝 Setting onRoomUpdated callback:', !!callback);
        this._onRoomUpdated = callback;
    }

    disconnect() {
        if (this.socket) {
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
            console.error('❌ Socket not connected for joinRoom');
            callback?.({ success: false, error: 'Socket not connected' });
            return;
        }

        this.rooms.add(roomId);

        // Thêm timeout để tránh treo
        const timeout = setTimeout(() => {
            callback?.({ success: false, error: 'Join room timeout' });
        }, 5000);

        // Determine if it's roomId (number) or roomCode (string)
        const isRoomId = typeof roomId === 'number' || /^\d+$/.test(roomId);
        const joinData = isRoomId 
            ? { roomId: Number(roomId) }
            : { roomCode: roomId };

        console.log('🔗 Joining room with data:', joinData);

        this.emit('join-room', joinData, (response) => {
            clearTimeout(timeout);
            if (response?.success) {
                console.log('✅ Successfully joined room:', roomId);
            } else {
                console.error('❌ Failed to join room:', roomId, response);
                this.rooms.delete(roomId);
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
            return;
        }

        this.rooms.delete(roomId);

        this.emit('leave-room', { roomId }, (response) => {
            if (response?.success) {
                console.log('✅ Successfully left room:', roomId);
            } else {
                console.error('❌ Failed to leave room:', roomId, response);
            }
            callback?.(response);
        });
    }

    /**
     * Start game in a room
     * @param {string|number} roomId - Room ID
     * @param {Function} callback - Optional acknowledgment callback
     */
    startGame(roomId, callback) {
        if (!this.socket || !this.connected) {
            console.error('❌ Socket not connected');
            callback?.({ success: false, error: 'Socket not connected' });
            return;
        }

        console.log('🎮 Starting game in room:', roomId);
        this.emit('start-game', { roomId }, (response) => {
            if (response?.success) {
                console.log('✅ Successfully started game in room:', roomId);
            } else {
                console.error('❌ Failed to start game:', roomId, response);
            }
            callback?.(response);
        });
    }

    /**
     * Subscribe to room list updates (for dashboard)
     */
    subscribeToRoomList(callback) {
        // Ensure connected
        if (!this.socket || !this.connected) {
            console.warn('⚠️ Socket not connected yet, attempting to connect before subscribing to room list');
        }

        // Remember subscription state for reconnects
        this._subscribedRoomList = true;

        // Ask backend to add this socket to the "room-list" room for broadcast
        try {
            this.emit('subscribe-room-list');
        } catch (e) {
            console.warn('⚠️ Failed to emit subscribe-room-list (will retry on connect):', e?.message);
        }

        // Wire listeners
        this.on('roomCreated', (data) => {
            callback({ type: 'CREATE_ROOM', data });
        });
        // Snake-case aliases for compatibility
        this.on('room-created', (data) => {
            callback({ type: 'CREATE_ROOM', data });
        });

        this.on('roomDeleted', (data) => {
            callback({ type: 'ROOM_DELETED', data });
        });
        this.on('room-deleted', (data) => {
            callback({ type: 'ROOM_DELETED', data });
        });

        this.on('roomUpdated', (data) => {
            callback({ type: 'ROOM_UPDATED', data });
        });
        this.on('room-updated', (data) => {
            callback({ type: 'ROOM_UPDATED', data });
        });
    }

    /**
     * Unsubscribe from room list updates
     */
    unsubscribeFromRoomList() {
        // Tell backend to leave the broadcast room
        try {
            this.emit('unsubscribe-room-list');
        } catch {}
        this._subscribedRoomList = false;

        // Detach listeners
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

        this.on('room-players', (data) => {
            if (data.roomId === roomId) {
                callback({ type: 'ROOM_PLAYERS_UPDATED', data });
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
        this.off('player-joined');
        this.off('player-left');
        this.off('room-players');
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

    // ==================== EVENT HELPER METHODS ====================
    // These methods provide a simpler API for common events

    /**
     * Listen for player joined events
     * @param {Function} callback - Callback function
     */
    onPlayerJoined(callback) {
        this.on('player-joined', callback);
    }

    /**
     * Listen for player left events
     * @param {Function} callback - Callback function
     */
    onPlayerLeft(callback) {
        this.on('player-left', callback);
    }

    /**
     * Listen for player kicked events
     * @param {Function} callback - Callback function
     */
    onPlayerKicked(callback) {
        this.on('player-kicked', callback);
    }

    /**
     * Listen for room players updates
     * @param {Function} callback - Callback function
     */
    onRoomPlayers(callback) {
        this.on('room-players', callback);
    }

    /**
     * Listen for game started events
     * @param {Function} callback - Callback function
     */
    onGameStarted(callback) {
        this.on('game-started', callback);
    }

    /**
     * Listen for question started events
     * @param {Function} callback - Callback function
     */
    onQuestionStarted(callback) {
        this.on('question-started', callback);
    }

    /**
     * Listen for next question events
     * @param {Function} callback - Callback function
     */
    onNextQuestion(callback) {
        this.on('next-question', callback);
    }

    /**
     * Listen for answer submitted events
     * @param {Function} callback - Callback function
     */
    onAnswerSubmitted(callback) {
        this.on('answer-submitted', callback);
    }

    /**
     * Listen for game finished/ended events
     * @param {Function} callback - Callback function
     */
    onGameFinished(callback) {
        this.on('game-ended', callback);
    }

    /**
     * Listen for error events
     * @param {Function} callback - Callback function
     */
    onError(callback) {
        this.on('error', callback);
    }

    /**
     * Listen for room created events
     * @param {Function} callback - Callback function
     */
    onRoomCreated(callback) {
        this.on('roomCreated', callback);
    }

    /**
     * Listen for room deleted events
     * @param {Function} callback - Callback function
     */
    onRoomDeleted(callback) {
        this.on('roomDeleted', callback);
    }

    /**
     * Listen for room updated events
     * @param {Function} callback - Callback function
     */
    onRoomUpdated(callback) {
        this.on('roomUpdated', callback);
    }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
