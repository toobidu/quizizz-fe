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
            // Connect to Socket.IO if not already connected
            if (!socketService.isConnected()) {
                await socketService.connect();
            }

            const state = get();
            if (state.isConnectedToRoom) {
                return;
            }

            // Setup room event listeners
            get().setupRoomListeners();

            set({ isConnectedToRoom: true });
        } catch (error) {
            set({ isConnectedToRoom: false, error: error.message });
        }
    },

    disconnectFromRoom: (shouldLeaveRoom = false) => {
        const state = get();

        // CRITICAL: Only actually leave room if explicitly requested
        // This prevents rooms from being destroyed on page reload/unmount
        if (shouldLeaveRoom && state.currentRoom) {
            socketService.leaveRoom(state.currentRoom.id);
        }
        // Silent disconnect for page unmount

        get().cleanupRoomListeners();
        set({ isConnectedToRoom: false });
    },

    // Setup Socket.IO listeners for room events
    setupRoomListeners: () => {
        // Player joined
        socketService.onPlayerJoined((data) => {
            get().fetchRoomPlayers(data.room?.id);
        });

        // Player left
        socketService.onPlayerLeft((data) => {
            const state = get();
            if (state.currentRoom) {
                get().fetchRoomPlayers(state.currentRoom.id);
            }
        });

        // Player kicked
        socketService.onPlayerKicked((data) => {
            const state = get();
            if (state.currentRoom) {
                get().fetchRoomPlayers(state.currentRoom.id);
            }
        });

        // Room players update
        socketService.onRoomPlayers((data) => {
            set({ roomPlayers: data.players || [] });
        });
    },

    // Cleanup Socket.IO listeners
    cleanupRoomListeners: () => {
        socketService.off('player-joined');
        socketService.off('player-left');
        socketService.off('player-kicked');
        socketService.off('room-players');
    },

    // Room CRUD operations
    createRoom: async (roomData) => {
        set({ isLoading: true, loading: true, error: null });

        try {
            const result = await roomApi.createRoom(roomData);

            if (result.success) {
                set({
                    currentRoom: result.data,
                    isLoading: false,
                    loading: false
                });
                return result;
            } else {
                set({
                    error: result.error,
                    isLoading: false,
                    loading: false
                });
                return result;
            }
        } catch (error) {
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
            // Join via REST API
            const result = await roomApi.joinRoomByCode(roomCode);

            if (result.success) {
                set({
                    currentRoom: result.data,
                    isLoading: false,
                    loading: false,
                    error: null
                });

                // Connect to Socket.IO after successful join
                if (!socketService.isConnected()) {
                    await socketService.connect();
                }

                // Setup listeners after joining
                get().setupRoomListeners();

                return result;
            } else {
                set({
                    error: result.error,
                    isLoading: false,
                    loading: false
                });
                return result;
            }
        } catch (error) {
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
            // Leave room
            const result = await roomApi.leaveRoom(state.currentRoom.id);

            if (result.success) {
                // Disconnect and actually leave the room
                get().disconnectFromRoom(true); // Pass true to actually leave
                get().clearCurrentRoom();

                return { success: true };
            } else {
                set({ error: result.error });
                return result;
            }
        } catch (error) {
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
            return { success: false, error: 'Không có ID phòng' };
        }

        try {
            const result = await roomApi.getRoomPlayers(roomId);

            if (result.success) {
                set({ roomPlayers: result.data || [] });
                return { success: true, data: result.data };
            } else {
                // Silently fail for "room not found" errors (zombie rooms)
                if (result.error?.includes('not found') || result.error?.includes('không tìm thấy')) {
                    return { success: false, error: null };
                }
                return result;
            }
        } catch (error) {
            // Silently fail for "room not found" errors
            const errorMsg = error.message || 'Có lỗi xảy ra khi tải danh sách người chơi';
            if (errorMsg.includes('not found') || errorMsg.includes('không tìm thấy')) {
                return { success: false, error: null };
            }
            return { success: false, error: errorMsg };
        }
    },

    // Real-time connection methods
    connectToRoom: async (roomId) => {
        if (!roomId) {
            return { success: false, error: 'Không có ID phòng' };
        }

        try {
            // Connect to Socket.IO if not already connected
            if (!socketService.isConnected()) {
                await socketService.connect();
            }

            // Setup room listeners
            get().setupRoomListeners();

            set({ isConnectedToRoom: true });
            return { success: true };
        } catch (error) {
            set({ isConnectedToRoom: false });
            return { success: false, error: error.message || 'Có lỗi xảy ra khi kết nối phòng' };
        }
    },

    disconnectFromRoom: () => {
        set({ isConnectedToRoom: false });
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
        // Implementation can be added if needed
    },

    stopAutoRefresh: () => {
        // Implementation can be added if needed
    },

    subscribeToRoomList: async () => {
        try {
            // Connect to Socket.IO if not connected
            if (!socketService.isConnected()) {
                await socketService.connect();
            }

            // Listen to global room broadcasts
            socketService.on('roomCreated', (data) => {
                const { room } = data;
                set(state => ({
                    rooms: [room, ...state.rooms]
                }));
                get().addNewRoom(room.id);
                get().addAnimatingRoom(room.id);
            });

            socketService.on('roomDeleted', (data) => {
                const { roomId } = data;
                set(state => ({
                    rooms: state.rooms.filter(r => r.id !== roomId)
                }));
                get().addAnimatingRoom(roomId);
            });

            socketService.on('roomUpdated', (data) => {
                const { room } = data;
                set(state => ({
                    rooms: state.rooms.map(r =>
                        r.id === room.id ? room : r
                    )
                }));
                get().addAnimatingRoom(room.id);
            });

            set({ isSubscribedToRoomList: true });
        } catch (error) {
            set({ error: 'Failed to subscribe to room updates' });
        }
    },

    unsubscribeFromRoomList: () => {
        socketService.off('roomCreated');
        socketService.off('roomDeleted');
        socketService.off('roomUpdated');
        set({ isSubscribedToRoomList: false });
    },

    startGame: async () => {
        const state = get();
        if (!state.currentRoom) {
            return { success: false, error: 'Không có phòng để bắt đầu game' };
        }

        try {
            const result = await roomApi.startGame(state.currentRoom.id);

            if (result.success) {
                return { success: true };
            } else {
                set({ error: result.error });
                return result;
            }
        } catch (error) {
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