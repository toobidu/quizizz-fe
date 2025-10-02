import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

/**
 * Socket.IO Service for Real-time Game Communication
 * Similar to Kahoot/Quizizz architecture
 */
class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.listeners = new Map();
    }

    /**
     * Connect to Socket.IO server
     * @returns {Promise<void>}
     */
    connect() {
        return new Promise((resolve, reject) => {
            if (this.connected && this.socket) {
                console.log('✅ Already connected to Socket.IO');
                return resolve();
            }

            const token = Cookies.get('accessToken');
            if (!token) {
                return reject(new Error('No authentication token found'));
            }

            // Socket.IO configuration
            this.socket = io('http://localhost:9092', {
                transports: ['websocket', 'polling'],
                auth: {
                    token: token
                },
                query: {
                    token: token
                },
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
            });

            // Connection event handlers
            this.socket.on('connect', () => {
                console.log('✅ Socket.IO connected:', this.socket.id);
                this.connected = true;
                this.reconnectAttempts = 0;
                resolve();
            });

            this.socket.on('disconnect', (reason) => {
                console.log('❌ Socket.IO disconnected:', reason);
                this.connected = false;

                if (reason === 'io server disconnect') {
                    // Server disconnected, manual reconnect needed
                    this.socket.connect();
                }
            });

            this.socket.on('connect_error', (error) => {
                console.error('🚨 Socket.IO connection error:', error.message);
                this.reconnectAttempts++;

                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    reject(new Error('Failed to connect after maximum attempts'));
                }
            });

            this.socket.on('error', (error) => {
                console.error('🚨 Socket.IO error:', error);
            });

            // Auto-reconnect successful
            this.socket.on('reconnect', (attemptNumber) => {
                console.log('🔄 Socket.IO reconnected after', attemptNumber, 'attempts');
                this.connected = true;
                this.reconnectAttempts = 0;
            });

            this.socket.on('reconnect_attempt', (attemptNumber) => {
                console.log('🔄 Attempting to reconnect...', attemptNumber);
            });

            this.socket.on('reconnect_failed', () => {
                console.error('🚨 Socket.IO reconnection failed');
                reject(new Error('Reconnection failed'));
            });
        });
    }

    /**
     * Disconnect from Socket.IO server
     */
    disconnect() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
            this.listeners.clear();
            console.log('🔌 Socket.IO disconnected');
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
            console.warn('⚠️ Socket not connected, cannot emit:', event);
            return;
        }

        if (callback) {
            this.socket.emit(event, data, callback);
        } else {
            this.socket.emit(event, data);
        }

        console.log('📤 Emitted:', event, data);
    }

    /**
     * Listen to an event from the server
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.socket) {
            console.warn('⚠️ Socket not initialized, cannot listen to:', event);
            return;
        }

        this.socket.on(event, (data) => {
            console.log('📥 Received:', event, data);
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
     * @param {Function} callback - Callback function to remove
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
            console.warn('⚠️ Socket not initialized');
            return;
        }

        this.socket.once(event, (data) => {
            console.log('📥 Received (once):', event, data);
            callback(data);
        });
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

    // ==================== ROOM EVENTS ====================

    /**
     * Join a room
     * @param {string} roomCode - Room code to join
     * @param {Function} callback - Callback with response
     */
    joinRoom(roomCode, callback) {
        this.emit('join-room', { roomCode }, callback);
    }

    /**
     * Leave a room
     * @param {number} roomId - Room ID to leave
     */
    leaveRoom(roomId) {
        this.emit('leave-room', { roomId });
    }

    /**
     * Kick a player from room (host only)
     * @param {number} roomId - Room ID
     * @param {number} playerId - Player ID to kick
     * @param {string} reason - Kick reason
     */
    kickPlayer(roomId, playerId, reason) {
        this.emit('kick-player', { roomId, playerId, reason });
    }

    /**
     * Start game (host only)
     * @param {number} roomId - Room ID
     */
    startGame(roomId) {
        this.emit('start-game', { roomId });
    }

    /**
     * Get room players
     * @param {number} roomId - Room ID
     */
    getPlayers(roomId) {
        this.emit('get-players', { roomId });
    }

    // ==================== GAME EVENTS ====================

    /**
     * Submit answer for current question
     * @param {number} roomId - Room ID
     * @param {number} questionId - Question ID
     * @param {number} answerId - Selected answer ID
     * @param {number} timeTaken - Time taken in milliseconds
     */
    submitAnswer(roomId, questionId, answerId, timeTaken) {
        this.emit('submit-answer', {
            roomId,
            questionId,
            answerId,
            timeTaken
        });
    }

    /**
     * Request next question (host only)
     * @param {number} roomId - Room ID
     */
    nextQuestion(roomId) {
        this.emit('next-question', { roomId });
    }

    // ==================== EVENT LISTENERS ====================

    /**
     * Listen to player joined event
     * @param {Function} callback - Callback with player data
     */
    onPlayerJoined(callback) {
        this.on('player-joined', callback);
    }

    /**
     * Listen to player left event
     * @param {Function} callback - Callback with player data
     */
    onPlayerLeft(callback) {
        this.on('player-left', callback);
    }

    /**
     * Listen to player kicked event
     * @param {Function} callback - Callback with kick data
     */
    onPlayerKicked(callback) {
        this.on('player-kicked', callback);
    }

    /**
     * Listen to game started event
     * @param {Function} callback - Callback with game data
     */
    onGameStarted(callback) {
        this.on('game-started', callback);
    }

    /**
     * Listen to answer submitted event
     * @param {Function} callback - Callback with answer result
     */
    onAnswerSubmitted(callback) {
        this.on('answer-submitted', callback);
    }

    /**
     * Listen to next question event
     * @param {Function} callback - Callback with question data
     */
    onNextQuestion(callback) {
        this.on('next-question', callback);
    }

    /**
     * Listen to game finished event
     * @param {Function} callback - Callback with final results
     */
    onGameFinished(callback) {
        this.on('game-finished', callback);
    }

    /**
     * Listen to room players update
     * @param {Function} callback - Callback with players list
     */
    onRoomPlayers(callback) {
        this.on('room-players', callback);
    }

    /**
     * Listen to errors
     * @param {Function} callback - Callback with error message
     */
    onError(callback) {
        this.on('error', callback);
        this.on('join-room-error', callback);
        this.on('leave-room-error', callback);
        this.on('kick-player-error', callback);
        this.on('start-game-error', callback);
        this.on('submit-answer-error', callback);
        this.on('next-question-error', callback);
    }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
