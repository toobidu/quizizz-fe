import { create } from 'zustand';
import roomApi from '../services/roomApi';
import socketService from '../services/socketService';
import socketManager from '../utils/socketManager';

/**
 * ✅ FIXED: Room Store with Socket.IO Real-time Updates
 * Standardized to match Kahoot/Quizizz architecture
 */
const useRoomStore = create((set, get) => ({
    // Room state
    currentRoom: null,
    rooms: [],
    roomPlayers: [],
    myRooms: [],
    isLoading: false,
    loading: false,
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

    // ========== SOCKET.IO REAL-TIME SUBSCRIPTIONS ==========

    subscribeToRoomList: async () => {
        try {
            const state = get();
            if (state.isSubscribedToRoomList) {
                console.log('📋 Already subscribed to room list');
                return;
            }

            console.log('📋 Subscribing to room list updates...');
            await socketManager.initialize();

            socketService.subscribeToRoomList((message) => {
                console.log('📋 Room list update:', message.type);
                
                if (message.type === 'CREATE_ROOM') {
                    const { room } = message.data;
                    set(state => {
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

    unsubscribeFromRoomList: () => {
        console.log('📋 Unsubscribing from room list updates');
        socketService.unsubscribeFromRoomList();
        set({ isSubscribedToRoomList: false });
    },

    /**
     * ✅ FIXED: Connect to room with proper event handling
     */
    connectToRoom: async (roomId) => {
        try {
            console.log('🔌 Connecting to room:', roomId);
            set({ error: null }); // Clear any previous errors
            
            // Initialize socket connection first
            await socketManager.initialize();
            
            if (!socketManager.isConnected()) {
                console.error('❌ Socket not connected after initialization');
                set({ error: 'Không thể kết nối Socket.IO server' });
                return;
            }
            
            // Setup listeners first - FIXED event types to match backend
            socketService.subscribeToRoom(roomId, (message) => {
                console.log('📡 Room event:', message.type, message.data);
                
                // ✅ FIXED: Handle EXACT backend event types
                if (message.type === 'PLAYER_JOINED') {
                    const { userId, username } = message.data;
                    console.log('👤 Player joined:', { userId, username });
                    
                    // Fetch fresh player list instead of manual update
                    get().fetchRoomPlayers(roomId);
                    
                } else if (message.type === 'PLAYER_LEFT') {
                    const { userId } = message.data;
                    console.log('👤 Player left:', { userId });
                    
                    // Fetch fresh player list instead of manual update
                    get().fetchRoomPlayers(roomId);
                    
                } else if (message.type === 'ROOM_PLAYERS_UPDATED') {
                    const { players } = message.data;
                    console.log('👥 Players updated:', players);
                    set({ roomPlayers: players });
                    
                } else if (message.type === 'ROOM_UPDATED') {
                    const roomData = message.data;
                    set({ currentRoom: roomData });
                    
                } else if (message.type === 'GAME_STARTED') {
                    console.log('🎮 Game started!');
                    // Dispatch custom event for navigation
                    window.dispatchEvent(new CustomEvent('gameStarted', { 
                        detail: { roomId: message.data.roomId } 
                    }));
                    
                } else if (message.type === 'PLAYER_KICKED') {
                    const { playerId, reason } = message.data;
                    const currentUserId = socketManager.getCurrentUserId();
                    
                    if (playerId === currentUserId) {
                        get().clearCurrentRoom();
                        set({ error: reason || 'Bạn đã bị đuổi khỏi phòng' });
                    } else {
                        // Refresh player list
                        get().fetchRoomPlayers(roomId);
                    }
                    
                } else if (message.type === 'HOST_CHANGED') {
                    const { newHostId } = message.data;
                    set(state => ({
                        currentRoom: state.currentRoom ? {
                            ...state.currentRoom,
                            ownerId: newHostId,
                            hostId: newHostId
                        } : null
                    }));
                    
                    // Refresh player list to update host status
                    get().fetchRoomPlayers(roomId);
                }
            });

            // Join room via Socket.IO
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    console.error('❌ Socket.IO join room timeout');
                    set({ error: 'Timeout khi kết nối đến phòng' });
                    reject(new Error('Join room timeout'));
                }, 10000);
                
                socketService.joinRoom(roomId, (response) => {
                    clearTimeout(timeout);
                    
                    console.log('🔥 Join room response:', response);
                    
                    if (response?.success !== false) {
                        set({ isConnectedToRoom: true });
                        console.log('✅ Connected to room:', roomId);
                        
                        // Initial fetch of players after successful connection
                        get().fetchRoomPlayers(roomId);
                        resolve();
                    } else {
                        const errorMsg = response?.message || response?.error || 'Không thể kết nối đến phòng';
                        console.error('❌ Failed to connect to room:', errorMsg);
                        set({ error: errorMsg });
                        reject(new Error(errorMsg));
                    }
                });
            });
        } catch (error) {
            console.error('❌ Failed to connect to room:', error);
            set({ error: error.message || 'Không thể kết nối đến phòng' });
            throw error;
        }
    },

    /**
     * Disconnect from current room
     */
    disconnectFromRoom: (roomId) => {
        if (!roomId) return;
        
        console.log('🔌 Disconnecting from room:', roomId);
        socketService.unsubscribeFromRoom(roomId);
        if (socketService.isConnected()) {
            socketService.leaveRoom(roomId);
        }
        set({ isConnectedToRoom: false });
    },

    // ========== API INTEGRATED ACTIONS ==========

    createRoom: async (roomData) => {
        set({ isLoading: true, loading: true, error: null });

        try {
            const response = await roomApi.createRoom(roomData);

            if (response.success) {
                const newRoom = response.data;

                set({
                    currentRoom: newRoom,
                    isLoading: false,
                    loading: false
                });

                // Connect to the newly created room with better error handling
                try {
                    await get().connectToRoom(newRoom.id);
                    console.log('✅ Successfully connected to created room');
                } catch (connectError) {
                    console.warn('⚠️ Failed to connect to Socket.IO, but room created successfully:', connectError.message);
                    // Don't fail the entire operation if Socket.IO fails
                    // The room is created successfully, user can still use it
                }

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

    joinRoomDirect: async (roomId) => {
        set({ isLoading: true, loading: true, error: null });

        try {
            const response = await roomApi.joinRoomDirect(roomId);

            if (response.success) {
                const room = response.data;
                set({ currentRoom: room, isLoading: false, loading: false });

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

    // Alias for backward compatibility
    joinRoom: async (roomCode) => {
        return await get().joinRoomByCode(roomCode);
    },

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
     * ✅ FIXED: Fetch room players with proper error handling
     */
    fetchRoomPlayers: async (roomId) => {
        if (!roomId) {
            return { success: false, error: 'Không có ID phòng' };
        }

        try {
            const response = await roomApi.getRoomPlayers(roomId);
            if (response.success) {
                const players = response.data || [];
                set({ roomPlayers: players });
                console.log('✅ Updated room players:', players.length);
                return { success: true, players };
            } else {
                console.error('Failed to fetch room players:', response.error);
                return { success: false, error: response.error };
            }
        } catch (error) {
            console.error('Error fetching room players:', error);
            return { success: false, error: error.message };
        }
    },

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

    deleteRoom: async (roomId) => {
        try {
            const response = await roomApi.deleteRoom(roomId);
            
            if (response.success) {
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

    // ========== GAME ACTIONS ==========

    /**
     * ✅ FIXED: Start game using Socket.IO
     */
    startGame: async () => {
        const state = get();
        if (!state.currentRoom) {
            return { success: false, error: 'Không có phòng để bắt đầu game' };
        }

        try {
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

    // ========== AUTO REFRESH & CLEANUP ==========

    autoRefreshInterval: null,

    startAutoRefresh: () => {
        const interval = setInterval(() => {
            if (!get().isSubscribedToRoomList) {
                get().fetchRooms();
            }
        }, 60000);

        set({ autoRefreshInterval: interval });
    },

    stopAutoRefresh: () => {
        const { autoRefreshInterval } = get();
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            set({ autoRefreshInterval: null });
        }
    },

    // Alias methods for backward compatibility
    loadRooms: async (params = {}) => {
        return get().fetchRooms(params);
    },

    cleanup: () => {
        console.log('🧹 Cleaning up room store...');
        
        const state = get();
        
        if (state.currentRoom) {
            get().disconnectFromRoom(state.currentRoom.id);
        }
        
        get().unsubscribeFromRoomList();
        get().stopAutoRefresh();
        
        socketManager.disconnect();
        
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