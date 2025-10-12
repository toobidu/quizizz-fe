import { create } from 'zustand';
import roomApi from '../services/roomApi';
import socketService from '../services/socketService';
import socketManager from '../utils/socketManager';

const useRoomStore = create((set, get) => ({
    // Trạng thái phòng
    currentRoom: null,
    rooms: [],
    roomPlayers: [],
    myRooms: [],
    isLoading: false,
    loading: false,
    error: null,
    isConnectedToRoom: false,
    isSubscribedToRoomList: false,

    // Trạng thái hoạt hình để phản hồi giao diện người dùng
    animatingRooms: new Set(),
    newRoomIds: new Set(),

    // Trạng thái nội bộ để tối ưu hóa
    _fetchPlayersTimer: null,

    // Hành động phòng
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

    // Trợ giúp hoạt hình
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

    // Quản lý kết nối WebSocket
    connectToRoom: async (roomId) => {
        try {
            // Kết nối đến Socket.IO nếu chưa kết nối
            if (!socketService.isConnected()) {
                await socketService.connect();
            }

            const state = get();
            if (state.isConnectedToRoom) {
                return;
            }

            // Thiết lập listeners sự kiện phòng
            get().setupRoomListeners();

            set({ isConnectedToRoom: true });
        } catch (error) {
            set({ isConnectedToRoom: false, error: error.message });
        }
    },

    disconnectFromRoom: (shouldLeaveRoom = false) => {
        const state = get();

        // Điều này ngăn phòng bị hủy khi tải lại/trở về trang
        if (shouldLeaveRoom && state.currentRoom) {
            socketService.leaveRoom(state.currentRoom.id);
        }
        // Ngắt kết nối im lặng cho việc unmount trang

        get().cleanupRoomListeners();
        set({ isConnectedToRoom: false });
    },

    // Thiết lập listeners Socket.IO cho sự kiện phòng
    setupRoomListeners: () => {
        get().cleanupRoomListeners();

        socketService.onPlayerJoined((data) => {
            // TỐI ƯU: Backend đã gửi mảng người chơi đầy đủ, không cần fetch
            if (data.players) {
                set({ roomPlayers: data.players });
            } else {
                // Fallback để fetch nếu không bao gồm người chơi
                get().fetchRoomPlayersDebounced(data.room?.id || data.roomId);
            }
        });

        socketService.onPlayerLeft((data) => {
            // TỐI ƯU: Sử dụng mảng người chơi từ sự kiện nếu có
            if (data.players) {
                set({ roomPlayers: data.players });
            } else {
                get().fetchRoomPlayersDebounced(data.roomId);
            }
        });

        socketService.onPlayerKicked((data) => {
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
            const state = get();
            if (state.currentRoom && data.roomId === state.currentRoom.id) {
                window.dispatchEvent(new CustomEvent('gameStarted', { detail: data }));
            }
        });

        socketService.onRoomDeleted((data) => {
            const state = get();
            if (state.currentRoom && state.currentRoom.id === data.roomId) {
                set({ error: 'Phòng đã bị xóa', currentRoom: null, roomPlayers: [] });
                window.location.href = '/dashboard';
            }
        });

        // MỚI: Lắng nghe sự kiện host-changed khi host rời đi
        socketService.on('host-changed', (data) => {
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
                // Làm mới danh sách người chơi để hiển thị host mới
                get().fetchRoomPlayersDebounced(data.roomId);
            }
        });
    },

    // Dọn dẹp listeners Socket.IO
    cleanupRoomListeners: () => {
        socketService.off('player-joined');
        socketService.off('player-left');
        socketService.off('player-kicked');
        socketService.off('game-started');
        socketService.off('room-players');
        socketService.off('host-changed'); // ✅ NEW: Clean up host-changed listener
    },

    // Hoạt động CRUD phòng
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

                // MỚI: Tự động tham gia phòng Socket.IO sau khi tạo
                if (!socketService.isConnected()) {
                    await socketService.connect();
                }

                const roomCodeToJoin = result.data.roomCode || result.data.code;
                if (roomCodeToJoin) {
                    // Thiết lập listeners trước khi tham gia
                    get().setupRoomListeners();

                    socketService.joinRoom(roomCodeToJoin, (response) => {
                        if (response?.success) {
                        } else {
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

                // Kết nối đến Socket.IO sau khi tham gia thành công
                if (!socketService.isConnected()) {
                    await socketService.connect();
                }

                // Thiết lập listeners sau khi tham gia
                get().setupRoomListeners();

                // ĐÃ SỬA: Tham gia phòng Socket.IO sử dụng roomCode (backend mong đợi roomCode)
                const roomCodeToJoin = result.data.roomCode || result.data.code || roomCode;
                socketService.joinRoom(roomCodeToJoin, (response) => {
                    if (response?.success) {
                    } else {
                        // Không thất bại toàn bộ hoạt động tham gia - Socket.IO chỉ dành cho real-time
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
                // Ngắt kết nối và thực sự rời phòng
                get().disconnectFromRoom(true); // Truyền true để thực sự rời
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
                // Im lặng thất bại cho lỗi "không tìm thấy phòng" (phòng zombie)
                if (result.error?.includes('not found') || result.error?.includes('không tìm thấy')) {
                    return { success: false, error: null };
                }
                return result;
            }
        } catch (error) {
            // Im lặng thất bại cho lỗi "không tìm thấy phòng"
            const errorMsg = error.message || 'Có lỗi xảy ra khi tải danh sách người chơi';
            if (errorMsg.includes('not found') || errorMsg.includes('không tìm thấy')) {
                return { success: false, error: null };
            }
            return { success: false, error: errorMsg };
        }
    },

    // Phiên bản debounced để ngăn nhiều cuộc gọi nhanh liên tiếp
    fetchRoomPlayersDebounced: (roomId, delay = 300) => {
        const state = get();

        // Xóa timer hiện có
        if (state._fetchPlayersTimer) {
            clearTimeout(state._fetchPlayersTimer);
        }

        // Đặt timer mới
        const timer = setTimeout(() => {
            get().fetchRoomPlayers(roomId);
            set({ _fetchPlayersTimer: null });
        }, delay);

        set({ _fetchPlayersTimer: timer });
    },

    // Phương thức kết nối thời gian thực
    connectToRoom: async (roomId) => {
        if (!roomId) {
            return { success: false, error: 'Không có ID phòng' };
        }

        try {
            // Kết nối đến Socket.IO nếu chưa kết nối
            if (!socketService.isConnected()) {
                await socketService.connect();
            }

            // Thiết lập các listener cho phòng
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

    // Các phương thức bí danh để tương thích ngược
    loadRooms: async (params = {}) => {
        return get().fetchRooms(params);
    },

    joinRoom: async (roomCode) => {
        return get().joinRoomByCode(roomCode);
    },

    // Các phương thức tự động làm mới
    startAutoRefresh: () => {
        // Có thể thêm implementation nếu cần
    },

    stopAutoRefresh: () => {
        // Có thể thêm implementation nếu cần
    },

    subscribeToRoomList: async () => {
        try {
            const state = get();
            if (state.isSubscribedToRoomList) {
                return;
            }

            if (!socketService.isConnected()) {
                await socketService.connect();
            }

            socketService.subscribeToRoomList((message) => {

                if (message.type === 'CREATE_ROOM') {
                    const room = message.data?.room || message.data;
                    if (room && room.id) {
                        set(state => {
                            const exists = state.rooms.find(r => r.id === room.id);
                            if (!exists) {
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
                        set(state => ({
                            rooms: state.rooms.map(r => r.id === room.id ? room : r),
                            currentRoom: state.currentRoom?.id === room.id ? room : state.currentRoom
                        }));
                    }
                }
            });

            set({ isSubscribedToRoomList: true });
        } catch (error) {
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
            // Sử dụng Socket.IO để bắt đầu game real-time
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

    // Dọn dẹp - chỉ sử dụng cho việc dọn dẹp cấp ứng dụng
    cleanup: () => {
        // Ngắt kết nối KHÔNG rời phòng (cho việc điều hướng trang/tải lại)
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

    fullCleanup: () => {
        // Ngắt kết nối VÀ rời phòng
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
