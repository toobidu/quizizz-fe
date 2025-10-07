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

        // Global handlers for debugging
        this.on('join-room-success', (data) => {
            console.log('✅ Global join room success:', data);
        });

        this.on('join-room-error', (data) => {
            console.error('❌ Global join room error:', data);
        });

        this.on('leave-room-success', (data) => {
            console.log('✅ Global leave room success:', data);
        });

        this.on('leave-room-error', (data) => {
            console.error('❌ Global leave room error:', data);
        });

        this.on('start-game-success', (data) => {
            console.log('✅ Start game success:', data);
        });

        this.on('start-game-error', (data) => {
            console.error('❌ Start game error:', data);
        });
    }

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

    once(event, callback) {
        if (!this.socket) {
            return;
        }

        this.socket.once(event, (data) => {
            callback(data);
        });
    }

    joinRoom(roomId, callback) {
        if (!this.socket || !this.connected) {
            console.error('❌ Socket not connected for joinRoom');
            callback?.({ success: false, error: 'Socket not connected' });
            return;
        }

        this.rooms.add(roomId);

        const timeout = setTimeout(() => {
            console.warn('⏰ Join room timeout for:', roomId);
            callback?.({ success: false, error: 'Join room timeout' });
        }, 10000);

        const joinData = { roomId: Number(roomId) };

        console.log('🔗 Joining room with data:', joinData);

        // Listen for success/error events
        const successHandler = (data) => {
            clearTimeout(timeout);
            console.log('✅ Join room success event:', data);
            this.off('join-room-success', successHandler);
            this.off('join-room-error', errorHandler);
            callback?.({ success: true, ...data });
        };

        const errorHandler = (data) => {
            clearTimeout(timeout);
            console.error('❌ Join room error event:', data);
            this.off('join-room-success', successHandler);
            this.off('join-room-error', errorHandler);
            this.rooms.delete(roomId);
            callback?.({ success: false, error: data.message || 'Failed to join room' });
        };

        this.once('join-room-success', successHandler);
        this.once('join-room-error', errorHandler);

        this.emit('join-room', joinData);
    }

    leaveRoom(roomId, callback) {
        if (!this.socket || !this.connected) {
            callback?.({ success: false, error: 'Socket not connected' });
            return;
        }

        this.rooms.delete(roomId);

        const timeout = setTimeout(() => {
            console.warn('⏰ Leave room timeout for:', roomId);
            callback?.({ success: false, error: 'Leave room timeout' });
        }, 10000);

        // Listen for success/error events
        const successHandler = (data) => {
            clearTimeout(timeout);
            console.log('✅ Leave room success event:', data);
            this.off('leave-room-success', successHandler);
            this.off('leave-room-error', errorHandler);
            callback?.({ success: true, ...data });
        };

        const errorHandler = (data) => {
            clearTimeout(timeout);
            console.error('❌ Leave room error event:', data);
            this.off('leave-room-success', successHandler);
            this.off('leave-room-error', errorHandler);
            callback?.({ success: false, error: data.message || 'Failed to leave room' });
        };

        this.once('leave-room-success', successHandler);
        this.once('leave-room-error', errorHandler);

        this.emit('leave-room', { roomId });
    }

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

    subscribeToRoomList(callback) {
        if (!this.socket || !this.connected) {
            console.warn('⚠️ Socket not connected yet, attempting to connect before subscribing to room list');
        }

        this._subscribedRoomList = true;

        try {
            this.emit('subscribe-room-list');
        } catch (e) {
            console.warn('⚠️ Failed to emit subscribe-room-list (will retry on connect):', e?.message);
        }

        this.on('roomCreated', (data) => {
            callback({ type: 'CREATE_ROOM', data });
        });
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

    unsubscribeFromRoomList() {
        try {
            this.emit('unsubscribe-room-list');
        } catch {}
        this._subscribedRoomList = false;

        this.off('roomCreated');
        this.off('roomDeleted');
        this.off('roomUpdated');
    }

    /**
     * ✅ FIXED: Subscribe to room events - EXACT match with backend
     */
    subscribeToRoom(roomId, callback) {
        console.log('📡 Subscribing to room events for room:', roomId);

        this.unsubscribeFromRoom(roomId);

        this._roomCallbacks = this._roomCallbacks || new Map();
        this._roomCallbacks.set(roomId, callback);

        // ✅ CRITICAL FIX: Match EXACT backend event names from RoomEventListener.java
        const handlePlayerJoined = (data) => {
            console.log('🔥 Backend player-joined event:', data);
            if (data.roomId === Number(roomId)) {
                callback({ type: 'PLAYER_JOINED', data });
            }
        };

        const handlePlayerLeft = (data) => {
            console.log('🔥 Backend player-left event:', data);
            if (data.roomId === Number(roomId)) {
                callback({ type: 'PLAYER_LEFT', data });
            }
        };

        const handleRoomPlayers = (data) => {
            console.log('🔥 Backend room-players event:', data);
            if (data.roomId === Number(roomId)) {
                callback({ type: 'ROOM_PLAYERS_UPDATED', data });
            }
        };

        const handleGameStarted = (data) => {
            console.log('🔥 Backend game-started event:', data);
            if (data.roomId === Number(roomId)) {
                callback({ type: 'GAME_STARTED', data });
            }
        };

        const handlePlayerKicked = (data) => {
            console.log('🔥 Backend player-kicked event:', data);
            if (data.roomId === Number(roomId)) {
                callback({ type: 'PLAYER_KICKED', data });
            }
        };

        // ✅ MISSING EVENT FIX: Add host-changed handler
        const handleHostChanged = (data) => {
            console.log('🔥 Backend host-changed event:', data);
            if (data.roomId === Number(roomId)) {
                callback({ type: 'HOST_CHANGED', data });
            }
        };

        this._roomHandlers = this._roomHandlers || new Map();
        this._roomHandlers.set(roomId, {
            'player-joined': handlePlayerJoined,
            'player-left': handlePlayerLeft,
            'room-players': handleRoomPlayers,
            'game-started': handleGameStarted,
            'player-kicked': handlePlayerKicked,
            'host-changed': handleHostChanged
        });

        // Register listeners - MUST match backend event names exactly
        this.on('player-joined', handlePlayerJoined);
        this.on('player-left', handlePlayerLeft);
        this.on('room-players', handleRoomPlayers);
        this.on('game-started', handleGameStarted);
        this.on('player-kicked', handlePlayerKicked);
        this.on('host-changed', handleHostChanged);
    }

    unsubscribeFromRoom(roomId) {
        if (!this._roomHandlers) return;
        
        const handlers = this._roomHandlers.get(roomId);
        if (handlers) {
            Object.entries(handlers).forEach(([event, handler]) => {
                this.off(event, handler);
            });
            
            this._roomHandlers.delete(roomId);
        }
        
        if (this._roomCallbacks) {
            this._roomCallbacks.delete(roomId);
        }
    }

    isConnected() {
        return this.connected && this.socket?.connected;
    }

    getSocketId() {
        return this.socket?.id || null;
    }

    getJoinedRooms() {
        return new Set(this.rooms);
    }

    // Event helper methods
    onPlayerJoined(callback) {
        this.on('player-joined', callback);
    }

    onPlayerLeft(callback) {
        this.on('player-left', callback);
    }

    onPlayerKicked(callback) {
        this.on('player-kicked', callback);
    }

    onRoomPlayers(callback) {
        this.on('room-players', callback);
    }

    onGameStarted(callback) {
        this.on('game-started', callback);
    }

    onQuestionStarted(callback) {
        this.on('question-started', callback);
    }

    onNextQuestion(callback) {
        this.on('next-question', callback);
    }

    onAnswerSubmitted(callback) {
        this.on('answer-submitted', callback);
    }

    onGameFinished(callback) {
        this.on('game-ended', callback);
    }

    onError(callback) {
        this.on('error', callback);
    }

    onRoomCreated(callback) {
        this.on('roomCreated', callback);
    }

    onRoomDeleted(callback) {
        this.on('roomDeleted', callback);
    }

    onRoomUpdated(callback) {
        this.on('roomUpdated', callback);
    }
}

const socketService = new SocketService();

export default socketService;