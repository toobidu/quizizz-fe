import { create } from 'zustand';
import roomApi from '../services/roomApi';
import socketService from '../services/socketService';

const useRoomStore = create((set, get) => ({
    // Room state
    currentRoom: null,
    rooms: [],
    roomPlayers: [],
    myRooms: [],
    isLoading: false,
    loading: false, // Alias for backward compatibility
    error: null,
    isConnectedToRoom: false,
    isSubscribedToRoomList: false,

    // Animation states for UI feedback
    animatingRooms: new Set(),
    newRoomIds: new Set(),

    // Room actions
    setCurrentRoom: (room) => set({ currentRoom: room }),

    clearCurrentRoom: () => {
        const state = get();
        set({
            currentRoom: null,
            roomPlayers: [],
            isConnectedToRoom: false
        });
    },

    setLoading: (isLoading) => set({ isLoading, loading: isLoading }),

    setError: (error) => set({ error }),

    setRoomPlayers: (players) => set({ roomPlayers: players }),

    clearError: () => set({ error: null }),

    // Animation helpers
    addAnimatingRoom: (roomId) => {
        set(state => ({
            animatingRooms: new Set(state.animatingRooms).add(roomId)
        }));
        setTimeout(() => {
            set(state => {
                const newSet = new Set(state.animatingRooms);
                newSet.delete(roomId);
                return { animatingRooms: newSet };
            });
        }, 1000);
    },

    addNewRoom: (roomId) => {
        set(state => ({
            newRoomIds: new Set(state.newRoomIds).add(roomId)
        }));
        setTimeout(() => {
            set(state => {
                const newSet = new Set(state.newRoomIds);
                newSet.delete(roomId);
                return { newRoomIds: newSet };
            });
        }, 3000);
    },

    // WebSocket connection management
    connectToRoom: async (roomId) => {
        try {
            console.log('🔌 Connecting to room via Socket.IO:', roomId);

            // Connect to Socket.IO if not already connected
            if (!socketService.isConnected()) {
                await socketService.connect();
            }

            const state = get();
            if (state.isConnectedToRoom) {
                console.log('Already connected to room, skipping...');
                return;
            }

            // Setup room event listeners
            get().setupRoomListeners();

            set({ isConnectedToRoom: true });
            console.log('✅ Successfully connected to room via Socket.IO');

        } catch (error) {
            console.error('⚠️ Socket.IO connection failed:', error);
            set({ isConnectedToRoom: false, error: error.message });
        }
    },

    disconnectFromRoom: (shouldLeaveRoom = false) => {
        const state = get();

        // CRITICAL: Only actually leave room if explicitly requested
        // This prevents rooms from being destroyed on page reload/unmount
        if (shouldLeaveRoom && state.currentRoom) {
            console.log('🚪 Explicitly leaving room:', state.currentRoom.id);
            socketService.leaveRoom(state.currentRoom.id);
        } else {
            console.log('🔌 Disconnecting from room (keeping membership)');
        }

        get().cleanupRoomListeners();
        set({ isConnectedToRoom: false });
    },

    // Setup Socket.IO listeners for room events
    setupRoomListeners: () => {
        console.log('🎧 Setting up room listeners');

        // Player joined
        socketService.onPlayerJoined((data) => {
            console.log('👤 Player joined:', data);
            get().fetchRoomPlayers(data.room?.id);
        });

        // Player left
        socketService.onPlayerLeft((data) => {
            console.log('👤 Player left:', data);
            const state = get();
            if (state.currentRoom) {
                get().fetchRoomPlayers(state.currentRoom.id);
            }
        });

        // Player kicked
        socketService.onPlayerKicked((data) => {
            console.log('🚫 Player kicked:', data);
            const state = get();
            if (state.currentRoom) {
                get().fetchRoomPlayers(state.currentRoom.id);
            }
        });

        // Room players update
        socketService.onRoomPlayers((data) => {
            console.log('👥 Room players updated:', data);
            set({ roomPlayers: data.players || [] });
        });
    },

    // Cleanup Socket.IO listeners
    cleanupRoomListeners: () => {
        console.log('🧹 Cleaning up room listeners');
        socketService.off('player-joined');
        socketService.off('player-left');
        socketService.off('player-kicked');
        socketService.off('room-players');
    },

    // Room CRUD operations
    createRoom: async (roomData) => {
        set({ isLoading: true, loading: true, error: null });

        try {
            console.log('Creating room with data:', roomData);
            const result = await roomApi.createRoom(roomData);

            if (result.success) {
                console.log('Room created successfully:', result.data);
                set({
                    currentRoom: result.data,
                    isLoading: false,
                    loading: false
                });
                return result;
            } else {
                console.error('Room creation failed:', result.error);
                set({
                    error: result.error,
                    isLoading: false,
                    loading: false
                });
                return result;
            }
        } catch (error) {
            console.error('Room creation error:', error);
            const errorMessage = error.message || 'Có lỗi xảy ra khi tạo phòng';
            set({
                error: errorMessage,
                isLoading: false,
                loading: false
            });
            return { success: false, error: errorMessage };
        }
    },

    joinRoomByCode: async (roomCode) => {
        set({ isLoading: true, loading: true, error: null });

        try {
            console.log('Joining room with code:', roomCode);

            // Connect to Socket.IO first
            if (!socketService.isConnected()) {
                await socketService.connect();
            }

            // Join via Socket.IO
            return new Promise((resolve, reject) => {
                socketService.joinRoom(roomCode, (response) => {
                    if (response && response.success) {
                        console.log('Room joined successfully:', response.data);
                        set({
                            currentRoom: response.data,
                            isLoading: false,
                            loading: false
                        });

                        // Setup listeners after joining
                        get().setupRoomListeners();

                        resolve(response);
                    } else {
                        console.error('Room join failed:', response?.error);
                        const errorMsg = response?.error || 'Không thể tham gia phòng';
                        set({
                            error: errorMsg,
                            isLoading: false,
                            loading: false
                        });
                        reject({ success: false, error: errorMsg });
                    }
                });
            });
        } catch (error) {
            console.error('Room join error:', error);
            const errorMessage = error.message || 'Có lỗi xảy ra khi tham gia phòng';
            set({
                error: errorMessage,
                isLoading: false,
                loading: false
            });
            return { success: false, error: errorMessage };
        }
    },

    leaveRoom: async () => {
        const state = get();
        if (!state.currentRoom) {
            return { success: false, error: 'Không có phòng để rời' };
        }

        try {
            console.log('🚪 Leaving room (explicit action):', state.currentRoom.id);
            const result = await roomApi.leaveRoom(state.currentRoom.id);

            if (result.success) {
                console.log('✅ Left room successfully');

                // Disconnect and actually leave the room
                get().disconnectFromRoom(true); // Pass true to actually leave
                get().clearCurrentRoom();

                return { success: true };
            } else {
                console.error('❌ Leave room failed:', result.error);
                set({ error: result.error });
                return result;
            }
        } catch (error) {
            console.error('❌ Leave room error:', error);
            const errorMessage = error.message || 'Có lỗi xảy ra khi rời phòng';
            set({ error: errorMessage });
            return { success: false, error: errorMessage };
        }
    },

    fetchRooms: async (params = {}) => {
        set({ isLoading: true, loading: true, error: null });

        try {
            const result = await roomApi.getPublicRooms(params);

            if (result.success) {
                const rooms = result.data.content || result.data.rooms || result.data || [];
                set({
                    rooms,
                    isLoading: false,
                    loading: false
                });
                return { success: true, data: rooms };
            } else {
                set({
                    error: result.error,
                    isLoading: false,
                    loading: false
                });
                return result;
            }
        } catch (error) {
            console.error('Fetch rooms error:', error);
            const errorMessage = error.message || 'Có lỗi xảy ra khi tải danh sách phòng';
            set({
                error: errorMessage,
                isLoading: false,
                loading: false
            });
            return { success: false, error: errorMessage };
        }
    },

    fetchRoomPlayers: async (roomId) => {
        if (!roomId) {
            console.warn('No room ID provided for fetching players');
            return { success: false, error: 'Không có ID phòng' };
        }

        try {
            console.log('Fetching players for room:', roomId);
            const result = await roomApi.getRoomPlayers(roomId);

            if (result.success) {
                console.log('Players fetched successfully:', result.data);
                set({ roomPlayers: result.data || [] });
                return { success: true, data: result.data };
            } else {
                console.error('Fetch players failed:', result.error);
                return result;
            }
        } catch (error) {
            console.error('Fetch players error:', error);
            return { success: false, error: error.message || 'Có lỗi xảy ra khi tải danh sách người chơi' };
        }
    },

    // Real-time connection methods
    connectToRoom: async (roomId) => {
        if (!roomId) {
            console.warn('No room ID provided for connection');
            return { success: false, error: 'Không có ID phòng' };
        }

        try {
            console.log('Connecting to room:', roomId);

            // Use static import instead of dynamic
            await webSocketManager.initialize();

            set({ isConnectedToRoom: true });
            console.log('Connected to room successfully:', roomId);

            return { success: true };
        } catch (error) {
            console.error('Connect to room error:', error);
            set({ isConnectedToRoom: false });
            return { success: false, error: error.message || 'Có lỗi xảy ra khi kết nối phòng' };
        }
    },

    disconnectFromRoom: () => {
        set({ isConnectedToRoom: false });
        console.log('Disconnected from room');
    },

    // Alias methods for backward compatibility
    loadRooms: async (params = {}) => {
        return get().fetchRooms(params);
    },

    joinRoom: async (roomCode) => {
        return get().joinRoomByCode(roomCode);
    },

    // Auto-refresh methods
    startAutoRefresh: () => {
        console.log('Auto-refresh started');
        // Implementation can be added if needed
    },

    stopAutoRefresh: () => {
        console.log('Auto-refresh stopped');
        // Implementation can be added if needed
    },

    subscribeToRoomList: () => {
        set({ isSubscribedToRoomList: true });
        console.log('Subscribed to room list');
    },

    unsubscribeFromRoomList: () => {
        set({ isSubscribedToRoomList: false });
        console.log('Unsubscribed from room list');
    },

    startGame: async () => {
        const state = get();
        if (!state.currentRoom) {
            return { success: false, error: 'Không có phòng để bắt đầu game' };
        }

        try {
            console.log('Starting game for room:', state.currentRoom.id);
            const result = await roomApi.startGame(state.currentRoom.id);

            if (result.success) {
                console.log('Game started successfully');
                return { success: true };
            } else {
                console.error('Start game failed:', result.error);
                set({ error: result.error });
                return result;
            }
        } catch (error) {
            console.error('Start game error:', error);
            const errorMessage = error.message || 'Có lỗi xảy ra khi bắt đầu game';
            set({ error: errorMessage });
            return { success: false, error: errorMessage };
        }
    },

    // Cleanup - use for app-level cleanup only
    cleanup: () => {
        // Disconnect WITHOUT leaving room (for page navigation/reload)
        get().disconnectFromRoom(false);

        set({
            isConnectedToRoom: false,
            isSubscribedToRoomList: false,
            currentRoom: null,
            roomPlayers: [],
            animatingRooms: new Set(),
            newRoomIds: new Set()
        });
    },

    // Full cleanup - actually leave room (for logout/explicit exit)
    fullCleanup: () => {
        // Disconnect AND leave room
        get().disconnectFromRoom(true);

        set({
            isConnectedToRoom: false,
            isSubscribedToRoomList: false,
            currentRoom: null,
            roomPlayers: [],
            rooms: [],
            myRooms: [],
            animatingRooms: new Set(),
            newRoomIds: new Set()
        });
    }
}));

export default useRoomStore;