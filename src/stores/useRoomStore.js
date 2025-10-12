import { create } from 'zustand';
import roomApi from '../services/roomApi';
import socketService from '../services/socketService';
import socketManager from '../utils/socketManager';

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

    // Internal state for optimization
    _fetchPlayersTimer: null,

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
        get().cleanupRoomListeners();

        socketService.onPlayerJoined((data) => {
            console.log('👥 Player joined room:', data);
            // ✅ OPTIMIZED: Backend already sends full players array, no need to fetch
            if (data.players) {
                set({ roomPlayers: data.players });
            } else {
                // Fallback to fetch if players not included
                get().fetchRoomPlayersDebounced(data.room?.id || data.roomId);
            }
        });

        socketService.onPlayerLeft((data) => {
            console.log('👋 Player left room:', data);
            // ✅ OPTIMIZED: Use players array from event if available
            if (data.players) {
                set({ roomPlayers: data.players });
            } else {
                get().fetchRoomPlayersDebounced(data.roomId);
            }
        });

        socketService.onPlayerKicked((data) => {
            console.log('🦵 Player kicked from room:', data);
            const state = get();
            const currentUserId = socketManager.getCurrentUserId();
            if (data.playerId === currentUserId) {
                set({ error: data.reason || 'Bạn đã bị đuổi khỏi phòng' });
                get().clearCurrentRoom();
                window.location.href = '/dashboard'; // Điều hướng về dashboard
            } else {
                get().fetchRoomPlayersDebounced(data.roomId);
            }
        });

        socketService.onGameStarted((data) => {
            console.log('🎮 Game started in room:', data);
            const state = get();
            if (state.currentRoom && data.roomId === state.currentRoom.id) {
                window.dispatchEvent(new CustomEvent('gameStarted', { detail: data }));
            }
        });

        socketService.onRoomDeleted((data) => {
            console.log('🗑️ Room deleted:', data);
            const state = get();
            if (state.currentRoom && state.currentRoom.id === data.roomId) {
                set({ error: 'Phòng đã bị xóa', currentRoom: null, roomPlayers: [] });
                window.location.href = '/dashboard';
            }
        });

        // ✅ NEW: Listen for host-changed event when host leaves
        socketService.on('host-changed', (data) => {
            console.log('👑 Host changed:', data);
            const state = get();
            if (state.currentRoom && state.currentRoom.id === data.roomId) {
                set({
                    currentRoom: {
                        ...state.currentRoom,
                        hostId: data.newHostId,
                        ownerId: data.newHostId,
                        ownerUsername: data.newHostUsername
                    }
                });
                // Refresh player list to show new host
                get().fetchRoomPlayersDebounced(data.roomId);
            }
        });
    },

    // Cleanup Socket.IO listeners
    cleanupRoomListeners: () => {
        socketService.off('player-joined');
        socketService.off('player-left');
        socketService.off('player-kicked');
        socketService.off('game-started');
        socketService.off('room-players');
        socketService.off('host-changed'); // ✅ NEW: Clean up host-changed listener
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

                // ✅ NEW: Auto-join Socket.IO room after creation
                if (!socketService.isConnected()) {
                    await socketService.connect();
                }

                const roomCodeToJoin = result.data.roomCode || result.data.code;
                if (roomCodeToJoin) {
                    // Setup listeners before joining
                    get().setupRoomListeners();

                    socketService.joinRoom(roomCodeToJoin, (response) => {
                        if (response?.success) {
                            console.log('✅ Auto-joined Socket.IO room after creation');
                        } else {
                            console.warn('⚠️ Failed to auto-join Socket.IO room after creation');
                        }
                    });
                }

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

                // ✅ FIXED: Join Socket.IO room using roomCode (backend expects roomCode)
                const roomCodeToJoin = result.data.roomCode || result.data.code || roomCode;
                socketService.joinRoom(roomCodeToJoin, (response) => {
                    if (response?.success) {
                        console.log('✅ Joined Socket.IO room for real-time updates');
                    } else {
                        console.warn('⚠️ Failed to join Socket.IO room, but REST join was successful');
                        // Don't fail the entire join operation - Socket.IO is for real-time only
                    }
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
                console.error('❌ fetchRooms failed:', result.error);
                set({
                    error: result.error,
                    isLoading: false,
                    loading: false
                });
                return result;
            }
        } catch (error) {
            console.error('❌ fetchRooms exception:', error);
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

    // Debounced version to prevent multiple rapid calls
    fetchRoomPlayersDebounced: (roomId, delay = 300) => {
        const state = get();

        // Clear existing timer
        if (state._fetchPlayersTimer) {
            clearTimeout(state._fetchPlayersTimer);
        }

        // Set new timer
        const timer = setTimeout(() => {
            get().fetchRoomPlayers(roomId);
            set({ _fetchPlayersTimer: null });
        }, delay);

        set({ _fetchPlayersTimer: timer });
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
            const state = get();
            if (state.isSubscribedToRoomList) {
                console.log('✅ Already subscribed to room list');
                return;
            }

            if (!socketService.isConnected()) {
                await socketService.connect();
            }

            socketService.subscribeToRoomList((message) => {
                console.log('📋 Room list update:', message.type, message.data);

                if (message.type === 'CREATE_ROOM') {
                    const room = message.data?.room || message.data;
                    if (room && room.id) {
                        set(state => {
                            const exists = state.rooms.find(r => r.id === room.id);
                            if (!exists) {
                                console.log('➕ Adding new room:', room.roomName || room.RoomName);
                                get().addNewRoom(room.id);
                                get().addAnimatingRoom(room.id);
                                return { rooms: [room, ...state.rooms] };
                            }
                            return state;
                        });
                    }
                } else if (message.type === 'ROOM_DELETED') {
                    const roomId = message.data?.roomId || message.data?.id;
                    if (roomId) {
                        console.log('🗑️ Removing room:', roomId);
                        set(state => {
                            const updatedRooms = state.rooms.filter(room => room.id !== roomId);
                            if (state.currentRoom?.id === roomId) {
                                window.location.href = '/dashboard';
                                return { rooms: updatedRooms, currentRoom: null, roomPlayers: [] };
                            }
                            return { rooms: updatedRooms };
                        });
                    }
                } else if (message.type === 'ROOM_UPDATED') {
                    const room = message.data?.room || message.data;
                    if (room && room.id) {
                        console.log('🔄 Updating room:', room.roomName || room.RoomName);
                        set(state => ({
                            rooms: state.rooms.map(r => r.id === room.id ? room : r),
                            currentRoom: state.currentRoom?.id === room.id ? room : state.currentRoom
                        }));
                    }
                }
            });

            set({ isSubscribedToRoomList: true });
        } catch (error) {
            console.error('❌ Failed to subscribe to room list:', error);
            set({ error: 'Không thể kết nối real-time updates' });
        }
    },

    unsubscribeFromRoomList: () => {
        try {
            socketService.unsubscribeFromRoomList();
        } catch {}
        socketService.setOnRoomCreated(null);
        socketService.setOnRoomDeleted(null);
        socketService.setOnRoomUpdated(null);
        set({ isSubscribedToRoomList: false });
    },

    startGame: async () => {
        const state = get();
        if (!state.currentRoom) {
            return { success: false, error: 'Không có phòng để bắt đầu game' };
        }

        try {
            // Use Socket.IO for real-time start game
            return new Promise((resolve) => {
                socketService.startGame(state.currentRoom.id, (response) => {
                    if (response?.success !== false) {
                        resolve({ success: true });
                    } else {
                        const errorMessage = response?.message || 'Không thể bắt đầu game';
                        set({ error: errorMessage });
                        resolve({ success: false, error: errorMessage });
                    }
                });
            });
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
