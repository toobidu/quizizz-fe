import apiInstance from './apiInstance';
import { mapRoomsFromBackend, mapRoomFromBackend, mapCreateRoomRequest } from '../utils/roomUtils';

const roomApi = {
    /**
     * Get all topics
     */
    getTopics: async () => {
        try {
            const response = await apiInstance.get('/topics');
            return {
                success: true,
                data: response.data.data || response.data || []
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể lấy danh sách chủ đề'
            };
        }
    },

    /**
     * Create a new room
     * @param {object} roomData - Room creation data
     */
    createRoom: async (roomData) => {
        try {
            console.log('roomApi.createRoom - Original data:', roomData);
            const mappedData = mapCreateRoomRequest(roomData);
            console.log('roomApi.createRoom - Mapped data for backend:', mappedData);

            const response = await apiInstance.post('/rooms', mappedData);
            console.log('roomApi.createRoom - Raw backend response:', response.data);

            const mappedRoom = mapRoomFromBackend(response.data.data);
            console.log('roomApi.createRoom - Mapped room for frontend:', mappedRoom);

            return {
                success: true,
                data: mappedRoom,
                message: response.data.message
            };
        } catch (error) {
            console.error('roomApi.createRoom - Error:', error);
            console.error('roomApi.createRoom - Error response:', error.response?.data);
            return {
                success: false,
                error: error.response?.data?.message || 'Có lỗi xảy ra khi tạo phòng'
            };
        }
    },

    /**
     * Get room by ID
     * @param {number} roomId - Room ID
     */
    getRoomById: async (roomId) => {
        try {
            const response = await apiInstance.get(`/rooms/${roomId}`);
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể lấy thông tin phòng'
            };
        }
    },

    /**
     * Get room by code
     * @param {string} roomCode - Room code
     */
    getRoomByCode: async (roomCode) => {
        try {
            console.log('roomApi.getRoomByCode - Requesting:', roomCode);
            const response = await apiInstance.get(`/rooms/code/${roomCode}`);
            console.log('roomApi.getRoomByCode - Raw response:', response.data);

            if (response.data.success !== false) {
                const mappedRoom = mapRoomFromBackend(response.data.data);
                console.log('roomApi.getRoomByCode - Mapped room:', mappedRoom);

                return {
                    success: true,
                    data: mappedRoom
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Không tìm thấy phòng với mã này'
                };
            }
        } catch (error) {
            console.error('roomApi.getRoomByCode - Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Không tìm thấy phòng với mã này'
            };
        }
    },

    /**
     * Join room by code
     * @param {string} roomCode - Room code to join
     */
    joinRoomByCode: async (roomCode) => {
        try {
            console.log('roomApi.joinRoomByCode - Joining room:', roomCode);
            const response = await apiInstance.post('/rooms/join', {
                roomCode: roomCode
            });
            console.log('roomApi.joinRoomByCode - Raw response:', response.data);

            if (response.data.success !== false) {
                const mappedRoom = mapRoomFromBackend(response.data.data);
                console.log('roomApi.joinRoomByCode - Mapped room:', mappedRoom);

                // Try to notify via WebSocket for real-time updates
                try {
                    const { default: websocketService } = await import('./websocketService');
                    const { default: authStore } = await import('../stores/authStore');

                    const user = authStore.getState().user;
                    if (user && mappedRoom.id) {
                        console.log('📡 Sending WebSocket join notification...');

                        // Send join notification via WebSocket
                        websocketService.send(`/app/room/${mappedRoom.id}/join`, {
                            roomCode: roomCode,
                            userId: user.id,
                            username: user.username
                        });
                    }
                } catch (wsError) {
                    console.warn('WebSocket notification failed (non-critical):', wsError);
                }

                return {
                    success: true,
                    data: mappedRoom,
                    message: response.data.message || 'Tham gia phòng thành công'
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Không thể tham gia phòng'
                };
            }
        } catch (error) {
            console.error('roomApi.joinRoomByCode - Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể tham gia phòng'
            };
        }
    },

    /**
     * Join public room directly
     * @param {number} roomId - Room ID
     */
    joinRoomDirect: async (roomId) => {
        try {
            const response = await apiInstance.post(`/rooms/${roomId}/join-direct`);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể tham gia phòng'
            };
        }
    },

    /**
     * Leave room
     * @param {number} roomId - Room ID
     */
    leaveRoom: async (roomId) => {
        try {
            const response = await apiInstance.delete(`/rooms/${roomId}/leave`);
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {

            return {
                success: false,
                error: error.response?.data?.message || 'Không thể rời phòng'
            };
        }
    },

    /**
     * Get room players
     * @param {number} roomId - Room ID
     */
    getRoomPlayers: async (roomId) => {
        try {
            const response = await apiInstance.get(`/rooms/${roomId}/players`);
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể lấy danh sách người chơi'
            };
        }
    },

    /**
     * Kick player from room (Host only)
     * @param {number} roomId - Room ID
     * @param {number} playerId - Player ID to kick
     * @param {string} reason - Kick reason
     */
    kickPlayer: async (roomId, playerId, reason) => {
        try {
            const response = await apiInstance.delete(`/rooms/${roomId}/kick`, {
                data: { playerId, reason }
            });
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {

            return {
                success: false,
                error: error.response?.data?.message || 'Không thể đuổi người chơi'
            };
        }
    },

    /**
     * Transfer host (Host only)
     * @param {number} roomId - Room ID
     * @param {number} newHostId - New host ID
     */
    transferHost: async (roomId, newHostId) => {
        try {
            const response = await apiInstance.post(`/rooms/${roomId}/transfer-host?newHostId=${newHostId}`);
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {

            return {
                success: false,
                error: error.response?.data?.message || 'Không thể chuyển quyền host'
            };
        }
    },

    /**
     * Start game (Host only)
     * @param {number} roomId - Room ID
     */
    startGame: async (roomId) => {
        try {
            const response = await apiInstance.post(`/rooms/${roomId}/start`);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            };
        } catch (error) {

            return {
                success: false,
                error: error.response?.data?.message || 'Không thể bắt đầu game'
            };
        }
    },

    /**
     * Get public rooms with pagination
     * @param {object} params - Query parameters
     */
    getPublicRooms: async (params = {}) => {
        try {
            const {
                page = 0,
                size = 6,
                search = ''
            } = params;

            // Thử endpoint đơn giản trước - không có status parameter
            const queryParams = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
                ...(search && { search })
            });

            const response = await apiInstance.get(`/rooms/all?${queryParams}`);
            const responseData = response.data.data || response.data;

            // Handle paginated response
            if (responseData.content) {
                const mappedRooms = mapRoomsFromBackend(responseData.content);
                return {
                    success: true,
                    data: {
                        ...responseData,
                        content: mappedRooms,
                        rooms: mappedRooms
                    }
                };
            } else {
                // Handle simple array response
                const mappedRooms = mapRoomsFromBackend(responseData);
                return {
                    success: true,
                    data: {
                        content: mappedRooms,
                        rooms: mappedRooms
                    }
                };
            }
        } catch (error) {
            console.error('Error in getPublicRooms:', error);

            // Fallback: thử endpoint khác
            try {
                const response = await apiInstance.get('/rooms');
                const mappedRooms = mapRoomsFromBackend(response.data.data || response.data || []);
                return {
                    success: true,
                    data: {
                        content: mappedRooms,
                        rooms: mappedRooms
                    }
                };
            } catch (fallbackError) {
                console.error('Fallback error:', fallbackError);

                return {
                    success: false,
                    error: error.response?.data?.message || 'Không thể lấy danh sách phòng'
                };
            }
        }
    },

    /**
     * Get my rooms
     */
    getMyRooms: async () => {
        try {
            const response = await apiInstance.get('/rooms/my-rooms');
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {

            return {
                success: false,
                error: error.response?.data?.message || 'Không thể lấy danh sách phòng của bạn'
            };
        }
    },

    /**
     * Search rooms
     * @param {string} query - Search query
     * @param {string} status - Room status filter
     */
    searchRooms: async (query, status = 'WAITING') => {
        try {
            const params = new URLSearchParams({ query, status });
            const response = await apiInstance.get(`/rooms/search?${params}`);
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {

            return {
                success: false,
                error: error.response?.data?.message || 'Không thể tìm kiếm phòng'
            };
        }
    },

    /**
     * Quick search rooms
     * @param {string} query - Search query
     */
    quickSearchRooms: async (query) => {
        try {
            const response = await apiInstance.get(`/rooms/quick-search?q=${encodeURIComponent(query)}`);
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {

            return {
                success: false,
                error: error.response?.data?.message || 'Không thể tìm kiếm phòng'
            };
        }
    },

    /**
     * Update room (Owner only)
     * @param {number} roomId - Room ID
     * @param {object} roomData - Updated room data
     */
    updateRoom: async (roomId, roomData) => {
        try {
            const response = await apiInstance.put(`/rooms/${roomId}`, roomData);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            };
        } catch (error) {

            return {
                success: false,
                error: error.response?.data?.message || 'Không thể cập nhật phòng'
            };
        }
    },

    /**
     * Delete room (Owner only)
     * @param {number} roomId - Room ID
     */
    deleteRoom: async (roomId) => {
        try {
            const response = await apiInstance.delete(`/rooms/${roomId}`);
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {

            return {
                success: false,
                error: error.response?.data?.message || 'Không thể xóa phòng'
            };
        }
    }
};

export default roomApi;
