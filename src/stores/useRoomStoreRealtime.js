import { create } from 'zustand';
import roomApi from '../services/roomApi';
import websocketService from '../services/websocketService';
import webSocketManager from '../utils/webSocketManager';

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
            websocketService.leaveRoom(state.currentRoom.id);
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

    // Real-time room list subscription
    subscribeToRoomList: async () => {
        try {
            const state = get();
            if (state.isSubscribedToRoomList) return;

            await webSocketManager.initialize();

            // Subscribe to room list updates
            websocketService.subscribe('/topic/rooms', (message) => {
                console.log('Room list update received:', message);

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

            // Subscribe to personal room notifications
            websocketService.subscribe('/user/queue/notifications', (message) => {
                console.log('Personal notification:', message);
                if (message.type === 'CREATE_ROOM_ERROR') {
                    set({ error: message.data });
                }
            });

            // Request initial room list
            websocketService.send('/app/rooms/subscribe', {});

            set({ isSubscribedToRoomList: true });
            console.log('Subscribed to room list updates');

        } catch (error) {
            console.error('Failed to subscribe to room list:', error);
            set({ error: 'Không thể kết nối real-time updates' });
        }
    },

    unsubscribeFromRoomList: () => {
        websocketService.unsubscribe('/topic/rooms');
        websocketService.unsubscribe('/user/queue/notifications');
        set({ isSubscribedToRoomList: false });
    },

    // WebSocket connection management for specific room
    connectToRoom: async (roomId) => {
        try {
            await webSocketManager.initialize();

            // Subscribe to room-specific events
            websocketService.subscribe(`/topic/room/${roomId}`, (message) => {
                console.log('Room event received:', message);

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
                    console.log('Game started:', message.data);
                } else if (message.type === 'PLAYER_KICKED') {
                    const { playerId, reason } = message.data;
                    if (playerId === websocketService.getCurrentUserId()) {
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

            // Send subscription message for this specific room
            websocketService.send(`/app/room/${roomId}/subscribe`, {});

            set({ isConnectedToRoom: true });
            console.log(`Connected to room ${roomId}`);

        } catch (error) {
            console.error('Failed to connect to room:', error);
            set({ error: 'Không thể kết nối đến phòng' });
        }
    },

    // Rest of the existing methods remain the same...
    // (keeping all the existing API methods like createRoom, joinRoom, etc.)

    // API integrated actions
    createRoom: async (roomData) => {
        set({ isLoading: true, loading: true, error: null });

        try {
            const response = await roomApi.createRoom(roomData);

            if (response.success) {
                const newRoom = response.data;

                // Don't add to local state immediately - wait for WebSocket event
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

    joinRoomByCode: async (roomCode) => {
        set({ isLoading: true, loading: true, error: null });

        try {
            const response = await roomApi.joinRoomByCode(roomCode);

            if (response.success) {
                const room = response.data;
                set({ currentRoom: room, isLoading: false, loading: false });

                // Connect to the joined room
                await get().connectToRoom(room.id);

                return { success: true, room, data: { Code: room.code || room.roomCode, message: 'Tham gia phòng thành công' } };
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

    // Alias for backward compatibility
    joinRoom: async (roomCode, isPublic = true) => {
        return await get().joinRoomByCode(roomCode);
    },

    leaveRoom: async () => {
        const state = get();
        if (!state.currentRoom) return { success: false, error: 'Không có phòng để rời' };

        try {
            const response = await roomApi.leaveRoom(state.currentRoom.id);

            if (response.success) {
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

    loadRooms: async (params = {}) => {
        return await get().fetchRooms(params);
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

    // ... rest of existing methods (fetchMyRooms, kickPlayer, etc.)

    // Auto refresh functionality (for backward compatibility)
    autoRefreshInterval: null,

    startAutoRefresh: () => {
        // With real-time updates, polling is less necessary
        // But keep for fallback
        const interval = setInterval(() => {
            if (!get().isSubscribedToRoomList) {
                get().fetchRooms();
            }
        }, 60000); // Reduced frequency since we have real-time

        set({ autoRefreshInterval: interval });
    },

    stopAutoRefresh: () => {
        const { autoRefreshInterval } = get();
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            set({ autoRefreshInterval: null });
        }
    },

    // Cleanup method for disconnecting WebSocket
    cleanup: () => {
        get().unsubscribeFromRoomList();
        webSocketManager.disconnect();
        const { autoRefreshInterval } = get();
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
        set({
            isConnectedToRoom: false,
            isSubscribedToRoomList: false,
            currentRoom: null,
            roomPlayers: [],
            autoRefreshInterval: null,
            animatingRooms: new Set(),
            newRoomIds: new Set()
        });
    }
}));

export default useRoomStore;