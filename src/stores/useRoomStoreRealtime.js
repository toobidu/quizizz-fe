import { create } from 'zustand';
import roomApi from '../services/roomApi';
import socketService from '../services/socketService';
import socketManager from '../utils/socketManager';

/**
 * Room Store with Socket.IO Real-time Updates
 * Standardized to match Kahoot/Quizizz architecture
 * 
 * NO MORE STOMP - Pure Socket.IO!
 */
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
        if (state.currentRoom) {
            socketService.leaveRoom(state.currentRoom.id);
        }
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

        // Remove animation flag after animation completes
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

        // Remove new flag after 3 seconds
        setTimeout(() => {
            set(state => {
                const newSet = new Set(state.newRoomIds);
                newSet.delete(roomId);
                return { newRoomIds: newSet };
            });
        }, 3000);
    },

    // ========== SOCKET.IO REAL-TIME SUBSCRIPTIONS ==========

    /**
     * Subscribe to room list updates (for dashboard)
     */
    subscribeToRoomList: async () => {
        try {
            const state = get();
            if (state.isSubscribedToRoomList) {
                console.log('📋 Already subscribed to room list');
                return;
            }

            console.log('📋 Subscribing to room list updates...');
            await socketManager.initialize();

            // Subscribe to room list updates using Socket.IO
            socketService.subscribeToRoomList((message) => {
                console.log('📋 Room list update:', message.type);
                
                if (message.type === 'CREATE_ROOM') {
                    const { room } = message.data;
                    set(state => {
                        // Check if room already exists
                        const exists = state.rooms.find(r => r.id === room.id);
                        if (!exists) {
                            get().addNewRoom(room.id);
                            get().addAnimatingRoom(room.id);
                            return {
                                rooms: [...state.rooms, room]
                            };
                        }
                        return state;
                    });
                } else if (message.type === 'ROOM_DELETED') {
                    const { roomId } = message.data;
                    get().addAnimatingRoom(roomId);

                    // Remove after animation
                    setTimeout(() => {
                        set(state => ({
                            rooms: state.rooms.filter(room => room.id !== roomId)
                        }));
                    }, 500);
                } else if (message.type === 'ROOM_UPDATED') {
                    const { room } = message.data;
                    set(state => ({
                        rooms: state.rooms.map(r => r.id === room.id ? room : r)
                    }));
                }
            });

            set({ isSubscribedToRoomList: true });
            console.log('✅ Subscribed to room list updates');
        } catch (error) {
            console.error('❌ Failed to subscribe to room list:', error);
            set({ error: 'Không thể kết nối real-time updates' });
        }
    },

    /**
     * Unsubscribe from room list updates
     */
    unsubscribeFromRoomList: () => {
        console.log('📋 Unsubscribing from room list updates');
        socketService.unsubscribeFromRoomList();
        set({ isSubscribedToRoomList: false });
    },

    /**
     * Connect to a specific room and subscribe to its events
     */
    connectToRoom: async (roomId) => {
        try {
            console.log('🔌 Connecting to room:', roomId);
            await socketManager.initialize();

            // Subscribe to room-specific events using Socket.IO
            socketService.subscribeToRoom(roomId, (message) => {
                console.log('📡 Room event:', message.type);
                
                if (message.type === 'JOIN_ROOM') {
                    const { userId, username } = message.data;
                    set(state => {
                        // Add player if not already in list
                        const exists = state.roomPlayers.find(p => p.id === userId);
                        if (!exists) {
                            return {
                                roomPlayers: [...state.roomPlayers, { id: userId, username }]
                            };
                        }
                        return state;
                    });
                } else if (message.type === 'LEAVE_ROOM') {
                    const { userId } = message.data;
                    set(state => ({
                        roomPlayers: state.roomPlayers.filter(p => p.id !== userId)
                    }));
                } else if (message.type === 'ROOM_UPDATED') {
                    const roomData = message.data;
                    set({ currentRoom: roomData });
                } else if (message.type === 'GAME_STARTED') {
                    // Handle game start
                    console.log('🎮 Game started!');
                } else if (message.type === 'PLAYER_KICKED') {
                    const { playerId, reason } = message.data;
                    const currentUserId = socketManager.getCurrentUserId();
                    
                    if (playerId === currentUserId) {
                        get().clearCurrentRoom();
                        set({ error: reason || 'Bạn đã bị đuổi khỏi phòng' });
                    } else {
                        // Remove other player from list
                        set(state => ({
                            roomPlayers: state.roomPlayers.filter(p => p.id !== playerId)
                        }));
                    }
                } else if (message.type === 'HOST_CHANGED') {
                    const { newHostId } = message.data;
                    set(state => ({
                        currentRoom: state.currentRoom ? {
                            ...state.currentRoom,
                            hostId: newHostId
                        } : null
                    }));
                }
            });

            // Join the room via Socket.IO
            socketService.joinRoom(roomId, (response) => {
                if (response?.success) {
                    set({ isConnectedToRoom: true });
                    console.log('✅ Connected to room:', roomId);
                } else {
                    console.error('❌ Failed to connect to room:', response?.error);
                    set({ error: 'Không thể kết nối đến phòng' });
                }
            });
        } catch (error) {
            console.error('❌ Failed to connect to room:', error);
            set({ error: 'Không thể kết nối đến phòng' });
        }
    },

    /**
     * Disconnect from current room
     */
    disconnectFromRoom: (roomId) => {
        if (!roomId) return;
        
        console.log('🔌 Disconnecting from room:', roomId);
        socketService.unsubscribeFromRoom(roomId);
        socketService.leaveRoom(roomId);
        set({ isConnectedToRoom: false });
    },

    // ========== API INTEGRATED ACTIONS ==========

    /**
     * Create a new room
     */
    createRoom: async (roomData) => {
        set({ isLoading: true, loading: true, error: null });

        try {
            const response = await roomApi.createRoom(roomData);

            if (response.success) {
                const newRoom = response.data;

                // Don't add to local state immediately - wait for Socket.IO event
                // This prevents duplicate entries
                set({
                    currentRoom: newRoom,
                    isLoading: false,
                    loading: false
                });

                // Connect to the newly created room
                await get().connectToRoom(newRoom.id);

                return { success: true, room: newRoom };
            } else {
                set({ error: response.error, isLoading: false, loading: false });
                return { success: false, error: response.error };
            }
        } catch (error) {
            const errorMessage = error.message || 'Có lỗi xảy ra khi tạo phòng';
            set({ error: errorMessage, isLoading: false, loading: false });
            return { success: false, error: errorMessage };
        }
    },

    /**
     * Join room by code
     */
    joinRoomByCode: async (roomCode) => {
        set({ isLoading: true, loading: true, error: null });

        try {
            const response = await roomApi.joinRoomByCode(roomCode);

            if (response.success) {
                const room = response.data;
                set({ currentRoom: room, isLoading: false, loading: false });

                // Connect to the joined room
                await get().connectToRoom(room.id);

                return { 
                    success: true, 
                    room, 
                    data: { 
                        Code: room.code || room.roomCode, 
                        message: 'Tham gia phòng thành công' 
                    } 
                };
            } else {
                set({ error: response.error, isLoading: false, loading: false });
                return { success: false, error: response.error };
            }
        } catch (error) {
            const errorMessage = error.message || 'Không thể tham gia phòng';
            set({ error: errorMessage, isLoading: false, loading: false });
            return { success: false, error: errorMessage };
        }
    },

    /**
     * Join room directly by ID
     */
    joinRoomDirect: async (roomId) => {
        set({ isLoading: true, loading: true, error: null });

        try {
            const response = await roomApi.joinRoomDirect(roomId);

            if (response.success) {
                const room = response.data;
                set({ currentRoom: room, isLoading: false, loading: false });

                // Connect to the joined room
                await get().connectToRoom(room.id);

                return { success: true, room };
            } else {
                set({ error: response.error, isLoading: false, loading: false });
                return { success: false, error: response.error };
            }
        } catch (error) {
            const errorMessage = error.message || 'Không thể tham gia phòng';
            set({ error: errorMessage, isLoading: false, loading: false });
            return { success: false, error: errorMessage };
        }
    },

    /**
     * Alias for backward compatibility
     */
    joinRoom: async (roomCode) => {
        return await get().joinRoomByCode(roomCode);
    },

    /**
     * Leave current room
     */
    leaveRoom: async () => {
        const state = get();
        if (!state.currentRoom) {
            return { success: false, error: 'Không có phòng để rời' };
        }

        try {
            const roomId = state.currentRoom.id;
            const response = await roomApi.leaveRoom(roomId);

            if (response.success) {
                get().disconnectFromRoom(roomId);
                get().clearCurrentRoom();
                return { success: true };
            } else {
                set({ error: response.error });
                return { success: false, error: response.error };
            }
        } catch (error) {
            const errorMessage = error.message || 'Không thể rời phòng';
            set({ error: errorMessage });
            return { success: false, error: errorMessage };
        }
    },

    /**
     * Fetch all public rooms
     */
    fetchRooms: async (params = {}) => {
        const state = get();
        if (state.isLoading) {
            return { success: false, error: 'Request already in progress' };
        }

        set({ isLoading: true, loading: true, error: null });

        try {
            const response = await roomApi.getPublicRooms(params);

            if (response.success) {
                const roomsData = response.data.content || response.data.rooms || response.data || [];
                set({ rooms: roomsData, isLoading: false, loading: false });

                // Subscribe to real-time updates after initial load
                if (!state.isSubscribedToRoomList) {
                    get().subscribeToRoomList();
                }

                return { success: true, rooms: roomsData };
            } else {
                set({ error: response.error, isLoading: false, loading: false });
                return { success: false, error: response.error };
            }
        } catch (error) {
            const errorMessage = error.message || 'Không thể tải danh sách phòng';
            set({ error: errorMessage, isLoading: false, loading: false });
            return { success: false, error: errorMessage };
        }
    },

    /**
     * Alias for backward compatibility
     */
    loadRooms: async (params = {}) => {
        return await get().fetchRooms(params);
    },

    /**
     * Fetch user's own rooms
     */
    fetchMyRooms: async () => {
        set({ isLoading: true, loading: true, error: null });

        try {
            const response = await roomApi.getMyRooms();

            if (response.success) {
                const myRoomsData = response.data || [];
                set({ myRooms: myRoomsData, isLoading: false, loading: false });
                return { success: true, rooms: myRoomsData };
            } else {
                set({ error: response.error, isLoading: false, loading: false });
                return { success: false, error: response.error };
            }
        } catch (error) {
            const errorMessage = error.message || 'Không thể tải phòng của bạn';
            set({ error: errorMessage, isLoading: false, loading: false });
            return { success: false, error: errorMessage };
        }
    },

    /**
     * Kick a player from room
     */
    kickPlayer: async (playerId) => {
        const state = get();
        if (!state.currentRoom) {
            return { success: false, error: 'Không có phòng hiện tại' };
        }

        try {
            const response = await roomApi.kickPlayer(state.currentRoom.id, playerId);
            return response;
        } catch (error) {
            const errorMessage = error.message || 'Không thể đuổi người chơi';
            return { success: false, error: errorMessage };
        }
    },

    /**
     * Delete a room
     */
    deleteRoom: async (roomId) => {
        try {
            const response = await roomApi.deleteRoom(roomId);
            
            if (response.success) {
                // Remove from local state
                set(state => ({
                    rooms: state.rooms.filter(room => room.id !== roomId),
                    myRooms: state.myRooms.filter(room => room.id !== roomId),
                    currentRoom: state.currentRoom?.id === roomId ? null : state.currentRoom
                }));
            }
            
            return response;
        } catch (error) {
            const errorMessage = error.message || 'Không thể xóa phòng';
            return { success: false, error: errorMessage };
        }
    },

    // ========== AUTO REFRESH & CLEANUP ==========

    autoRefreshInterval: null,

    /**
     * Start auto-refresh (fallback for when Socket.IO fails)
     */
    startAutoRefresh: () => {
        // With Socket.IO, polling is less necessary
        // But keep for fallback
        const interval = setInterval(() => {
            if (!get().isSubscribedToRoomList) {
                get().fetchRooms();
            }
        }, 60000); // Reduced frequency since we have real-time

        set({ autoRefreshInterval: interval });
    },

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh: () => {
        const { autoRefreshInterval } = get();
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            set({ autoRefreshInterval: null });
        }
    },

    /**
     * Cleanup method for disconnecting Socket.IO
     */
    cleanup: () => {
        console.log('🧹 Cleaning up room store...');
        
        const state = get();
        
        // Disconnect from current room
        if (state.currentRoom) {
            get().disconnectFromRoom(state.currentRoom.id);
        }
        
        // Unsubscribe from room list
        get().unsubscribeFromRoomList();
        
        // Stop auto-refresh
        get().stopAutoRefresh();
        
        // Disconnect Socket.IO
        socketManager.disconnect();
        
        // Reset state
        set({
            isConnectedToRoom: false,
            isSubscribedToRoomList: false,
            currentRoom: null,
            roomPlayers: [],
            autoRefreshInterval: null,
            animatingRooms: new Set(),
            newRoomIds: new Set()
        });
        
        console.log('✅ Room store cleanup complete');
    }
}));

export default useRoomStore;
