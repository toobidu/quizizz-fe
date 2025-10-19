import axios from 'axios';
import axiosRetry from 'axios-retry';
import apiInstance from './apiInstance';
import { mapRoomsFromBackend, mapRoomFromBackend, mapCreateRoomRequest } from '../utils/roomUtils';

// Thêm retry mechanism
axiosRetry(apiInstance, {
    retries: 3,
    retryDelay: (retryCount) => retryCount * 1000, // Delay 1s, 2s, 3s
    retryCondition: (error) => axiosRetry.isNetworkOrIdempotentRequestError(error)
});

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
            const mappedData = mapCreateRoomRequest(roomData);
            const response = await apiInstance.post('/rooms', mappedData);
            const mappedRoom = mapRoomFromBackend(response.data.data);
            return {
                success: true,
                data: mappedRoom,
                message: response.data.message
            };
        } catch (error) {
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
            const response = await apiInstance.get(`/rooms/code/${roomCode}`);
            if (response.data.success !== false) {
                const mappedRoom = mapRoomFromBackend(response.data.data);
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
            return {
                success: false,
                error: error.response?.data?.message || 'Không tìm thấy phòng với mã này'
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
            // Error leaving room
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
            // Error kicking player
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
            // Error transferring host
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
            // Error starting game
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể bắt đầu game'
            };
        }
    },

    /**
     * Get all rooms with pagination (simplified - only WAITING rooms)
     * @param {object} params - Query parameters
     */
    getPublicRooms: async (params = {}) => {
        try {
            const { page = 0, size = 6, search = '' } = params;
            const queryParams = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
                ...(search && { search })
            });

            const response = await apiInstance.get(`/rooms?${queryParams}`);
            const responseData = response.data.data || response.data;

            // Chuẩn hóa response
            let mappedRooms = [];
            if (Array.isArray(responseData)) {
                mappedRooms = mapRoomsFromBackend(responseData);
            } else if (responseData.content) {
                mappedRooms = mapRoomsFromBackend(responseData.content);
            } else if (responseData.rooms) {
                mappedRooms = mapRoomsFromBackend(responseData.rooms);
            } else {
            }

            return {
                success: true,
                data: {
                    content: mappedRooms,
                    rooms: mappedRooms,
                    totalPages: responseData.totalPages || Math.ceil(mappedRooms.length / size),
                    totalElements: responseData.totalElements || mappedRooms.length,
                    page,
                    size
                }
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể lấy danh sách phòng';
            const errorCode = error.response?.data?.code || 'UNKNOWN_ERROR';
            return {
                success: false,
                error: errorMessage,
                errorCode
            };
        }
    },

    joinRoomByCode: async (roomCode) => {
        try {
            const requestData = { roomCode: roomCode };
            const response = await apiInstance.post('/rooms/join', requestData);

            if (response.data.success !== false) {
                const mappedRoom = mapRoomFromBackend(response.data.data);
                return {
                    success: true,
                    data: mappedRoom,
                    message: response.data.message || 'Tham gia phòng thành công'
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Không tìm thấy phòng với mã này',
                    errorCode: response.data.code || 'ROOM_NOT_FOUND'
                };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không tìm thấy phòng với mã này';
            const errorCode = error.response?.data?.code || 'ROOM_NOT_FOUND';
            return {
                success: false,
                error: errorMessage,
                errorCode
            };
        }
    },


    /**
     * Get my rooms (rooms created by current user)
     */
    getMyRooms: async (page = 0, size = 10) => {
        try {
            // Use unified API with myRoomsOnly parameter
            const queryParams = new URLSearchParams({
                myRoomsOnly: 'true',
                page: page.toString(),
                size: size.toString()
            });
            const response = await apiInstance.get(`/rooms?${queryParams}`);
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            // Error getting my rooms
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
    searchRooms: async (query, status = 'WAITING', page = 0, size = 20) => {
        try {
            // Use unified API with search parameter
            const params = new URLSearchParams({
                search: query,
                status,
                page: page.toString(),
                size: size.toString(),
                publicOnly: 'true'
            });
            const response = await apiInstance.get(`/rooms?${params}`);
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            // Error searching rooms
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể tìm kiếm phòng'
            };
        }
    },

    /**
     * Quick search rooms (lightweight search with fewer results)
     * @param {string} query - Search query
     */
    quickSearchRooms: async (query) => {
        try {
            // Use unified API with search parameter and smaller page size
            const params = new URLSearchParams({
                search: query,
                page: '0',
                size: '5',
                publicOnly: 'true',
                status: 'WAITING'
            });
            const response = await apiInstance.get(`/rooms?${params}`);
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            // Error quick searching rooms
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
            // Error updating room
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
            // Error deleting room
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể xóa phòng'
            };
        }
    }
};

export default roomApi;