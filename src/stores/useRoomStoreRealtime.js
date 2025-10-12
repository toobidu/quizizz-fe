import { create } from 'zustand';
import roomApi from '../services/roomApi';
import socketService from '../services/socketService';
import socketManager from '../utils/socketManager';

/**
 * ✅ ĐÃ SỬA: Kho lưu trữ phòng với cập nhật thời gian thực Socket.IO
 * Được chuẩn hóa để phù hợp với kiến trúc Kahoot/Quizizz
 */
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

    // Hành động phòng
    setCurrentRoom: (room) => set({ currentRoom: room }),

    clearCurrentRoom: () => {
        const state = get();
        if (state.currentRoom) {
            get().disconnectFromRoom(state.currentRoom.id);
        }
        set({
            currentRoom: null,
            roomPlayers: [],
            isConnectedToRoom: false,
            error: null  // ✅ Xóa mọi lỗi hiện có khi xóa phòng
        });

        // Buộc làm mới danh sách phòng khi xóa phòng hiện tại
        setTimeout(() => {
            get().fetchRooms();
        }, 100);
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

    // ========== ĐĂNG KÝ THỜI GIAN THỰC SOCKET.IO ==========

    subscribeToRoomList: async () => {
        try {
            const state = get();
            if (state.isSubscribedToRoomList) {
                return;
            }

            await socketManager.initialize();

            // ✅ Đảm bảo socket được kết nối trước khi đăng ký
            if (!socketManager.isConnected()) {
                return;
            }

            socketService.subscribeToRoomList((message) => {

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

                    set(state => {
                        const updatedRooms = state.rooms.map(r => {
                            if (r.id === room.id) {
                                return { ...r, ...room };
                            }
                            return r;
                        });

                        return { rooms: updatedRooms };
                    });
                }
            });

            set({ isSubscribedToRoomList: true });
        } catch (error) {
            set({ error: 'Không thể kết nối real-time updates' });
        }
    },

    unsubscribeFromRoomList: () => {
        socketService.unsubscribeFromRoomList();
        set({ isSubscribedToRoomList: false });
    },

    /**
     * ✅ ĐÃ SỬA: Kết nối đến phòng với xử lý sự kiện đúng cách
     */
    connectToRoom: async (roomId) => {
        try {
            set({ error: null }); // Xóa mọi lỗi trước đó

            // Khởi tạo kết nối socket trước
            await socketManager.initialize();

            if (!socketManager.isConnected()) {
                set({ error: 'Không thể kết nối Socket.IO server' });
                return;
            }

            // ✅ SỬA: Lấy roomCode từ currentRoom thay vì sử dụng roomId trực tiếp
            const state = get();
            const roomCode = state.currentRoom?.roomCode || state.currentRoom?.code || state.currentRoom?.Code;

            if (!roomCode) {
                set({ error: 'Không tìm thấy mã phòng' });
                return;
            }

            // Thiết lập listeners trước - SỬA loại sự kiện để phù hợp với backend
            socketService.subscribeToRoom(roomId, (message) => {

                // ✅ SỬA: Xử lý CHÍNH XÁC loại sự kiện backend
                if (message.type === 'PLAYER_JOINED') {
                    const { userId, username } = message.data;

                    // Lấy danh sách người chơi mới thay vì cập nhật thủ công
                    get().fetchRoomPlayers(roomId);

                } else if (message.type === 'PLAYER_LEFT') {
                    const { userId } = message.data;

                    // Lấy danh sách người chơi mới thay vì cập nhật thủ công
                    get().fetchRoomPlayers(roomId);

                } else if (message.type === 'ROOM_PLAYERS_UPDATED') {
                    const { players } = message.data;
                    set({ roomPlayers: players });

                } else if (message.type === 'ROOM_UPDATED') {
                    const roomData = message.data;
                    set({ currentRoom: roomData });

                } else if (message.type === 'GAME_STARTED') {
                    // Gửi sự kiện tùy chỉnh để điều hướng
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
                        // Làm mới danh sách người chơi
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

                    // Làm mới danh sách người chơi để cập nhật trạng thái host
                    get().fetchRoomPlayers(roomId);
                }
            });

            // ✅ SỬA: Tham gia phòng qua Socket.IO sử dụng roomCode thay vì roomId
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    set({ error: 'Timeout khi kết nối đến phòng' });
                    reject(new Error('Join room timeout'));
                }, 10000);

                socketService.joinRoom(roomCode, (response) => {
                    clearTimeout(timeout);

                    if (response?.success !== false) {
                        set({ isConnectedToRoom: true });

                        // Lấy người chơi ban đầu sau khi kết nối thành công
                        get().fetchRoomPlayers(roomId);
                        resolve();
                    } else {
                        const errorMsg = response?.message || response?.error || 'Không thể kết nối đến phòng';

                        if (errorMsg.includes('Room is full') ||
                            errorMsg.includes('User already joined') ||
                            errorMsg.includes('already joined')) {
                            set({
                                isConnectedToRoom: true,
                                error: null  // Xóa mọi trạng thái lỗi
                            });

                            // Vẫn thử lấy người chơi để đảm bảo UI được cập nhật
                            get().fetchRoomPlayers(roomId);
                            resolve();
                        } else {
                            set({ error: errorMsg });
                            reject(new Error(errorMsg));
                        }
                    }
                });
            });
        } catch (error) {
            set({ error: error.message || 'Không thể kết nối đến phòng' });
            throw error;
        }
    },

    /**
     * Ngắt kết nối khỏi phòng hiện tại
     */
    disconnectFromRoom: (roomId) => {
        if (!roomId) {
            return;
        }

        // Hủy đăng ký sự kiện phòng
        socketService.unsubscribeFromRoom(roomId);

        // Rời phòng Socket.IO nếu đã kết nối
        if (socketService.isConnected()) {
            socketService.leaveRoom(roomId, (response) => {
            });
        }

        set({ isConnectedToRoom: false });
    },

    // ========== HÀNH ĐỘNG TÍCH HỢP API ==========

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

                // Kết nối đến phòng vừa tạo với xử lý lỗi được cải thiện
                try {
                    await get().connectToRoom(newRoom.id);
                } catch (connectError) {
                    // ✅ CẢI THIỆN: Xử lý các lỗi kết nối phổ biến một cách nhẹ nhàng
                    if (connectError.message.includes('Room is full') ||
                        connectError.message.includes('User already joined') ||
                        connectError.message.includes('already joined')) {
                        // Người dùng đã ở trong phòng (từ việc tạo), đây là trạng thái mong muốn
                        set({
                            isConnectedToRoom: true,
                            error: null  // Xóa mọi trạng thái lỗi
                        });
                        // Lấy người chơi để đảm bảo UI được cập nhật đúng cách
                        get().fetchRoomPlayers(newRoom.id);
                    } else {
                        // Không thất bại toàn bộ hoạt động cho các lỗi socket khác
                        // Phòng được tạo thành công, người dùng vẫn có thể sử dụng
                    }
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

                // ✅ CẢI THIỆN: Xử lý lỗi kết nối nhẹ nhàng cho việc tham gia dựa trên mã
                try {
                    await get().connectToRoom(room.id);
                    return {
                        success: true,
                        room,
                        data: {
                            Code: room.code || room.roomCode,
                            message: 'Tham gia phòng thành công'
                        }
                    };
                } catch (connectError) {
                    if (connectError.message.includes('Room is full') ||
                        connectError.message.includes('User already joined') ||
                        connectError.message.includes('already joined')) {
                        set({
                            isConnectedToRoom: true,
                            error: null
                        });
                        get().fetchRoomPlayers(room.id);
                        return {
                            success: true,
                            room,
                            data: {
                                Code: room.code || room.roomCode,
                                message: 'Tham gia phòng thành công'
                            }
                        };
                    } else {
                        throw connectError; // Ném lại các lỗi kết nối khác
                    }
                }
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

                // ✅ CẢI THIỆN: Xử lý lỗi kết nối nhẹ nhàng cho việc tham gia trực tiếp
                try {
                    await get().connectToRoom(room.id);
                    return { success: true, room };
                } catch (connectError) {
                    if (connectError.message.includes('Room is full') ||
                        connectError.message.includes('User already joined') ||
                        connectError.message.includes('already joined')) {
                        set({
                            isConnectedToRoom: true,
                            error: null
                        });
                        get().fetchRoomPlayers(room.id);
                        return { success: true, room };
                    } else {
                        throw connectError; // Ném lại các lỗi kết nối khác
                    }
                }
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

    // Bí danh để tương thích ngược
    joinRoom: async (roomCode) => {
        return await get().joinRoomByCode(roomCode);
    },

    leaveRoom: async () => {
        const state = get();
        if (!state.currentRoom) {
            return { success: false, error: 'Không có phòng để rời' };
        }

        const roomId = state.currentRoom.id;

        try {
            // Ngắt kết nối từ Socket.IO trước
            get().disconnectFromRoom(roomId);

            // Xóa trạng thái phòng ngay lập tức để cập nhật UI tức thì
            get().clearCurrentRoom();

            // Sau đó gọi REST API để rời phòng
            const response = await roomApi.leaveRoom(roomId);

            if (response.success) {

                // Buộc làm mới danh sách phòng để đảm bảo UI được cập nhật
                setTimeout(() => {
                    get().fetchRooms();
                }, 100);

                // ✅ Kích hoạt điều hướng đến RoomPage sau khi rời thành công
                window.dispatchEvent(new CustomEvent('navigateToRoomList', {
                    detail: {
                        reason: 'left_room',
                        message: 'Đã rời phòng thành công'
                    }
                }));

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
            return { success: false, error: 'Yêu cầu đang được xử lý' };
        }

        set({ isLoading: true, loading: true, error: null });

        try {
            const response = await roomApi.getPublicRooms(params);

            if (response.success) {
                const roomsData = response.data.content || response.data.rooms || response.data || [];
                set({ rooms: roomsData, isLoading: false, loading: false });

                // Đăng ký cập nhật thời gian thực sau khi tải ban đầu
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
     * ✅ ĐÃ SỬA: Lấy người chơi phòng với xử lý lỗi đúng cách
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
                return { success: true, players };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
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

    // ========== HÀNH ĐỘNG GAME ==========

    /**
     * ✅ ĐÃ SỬA: Bắt đầu game sử dụng Socket.IO
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

    // ========== TỰ ĐỘNG LÀM MỚI & DỌN DẸP ==========

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

    // Phương thức bí danh để tương thích ngược
    loadRooms: async (params = {}) => {
        return get().fetchRooms(params);
    },

    cleanup: () => {

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

    }
}));

export default useRoomStore;
