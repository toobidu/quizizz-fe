import { create } from 'zustand';

// Mock data for rooms
const mockRooms = [
    {
        RoomCode: 'ABC123',
        RoomName: 'Phòng toán học vui',
        TopicName: 'Toán học',
        HostName: 'Nguyễn Văn A',
        MaxPlayers: 4,
        CurrentPlayers: 2,
        IsPrivate: false,
        Status: 'waiting',
        CreatedAt: new Date().toISOString(),
        EndTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
        Settings: {
            timeLimit: 60,
            questionCount: 10,
            gameMode: '1vs1'
        }
    },
    {
        RoomCode: 'DEF456',
        RoomName: 'Lịch sử Việt Nam',
        TopicName: 'Lịch sử',
        HostName: 'Trần Thị B',
        MaxPlayers: 6,
        CurrentPlayers: 4,
        IsPrivate: false,
        Status: 'waiting',
        CreatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
        EndTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 minutes from now
        Settings: {
            timeLimit: 45,
            questionCount: 15,
            gameMode: 'battle'
        }
    },
    {
        RoomCode: 'GHI789',
        RoomName: 'Khoa học tự nhiên',
        TopicName: 'Khoa học',
        HostName: 'Lê Văn C',
        MaxPlayers: 8,
        CurrentPlayers: 6,
        IsPrivate: false,
        Status: 'waiting',
        CreatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        EndTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 minutes from now
        Settings: {
            timeLimit: 30,
            questionCount: 20,
            gameMode: 'battle'
        }
    },
    {
        RoomCode: 'JKL012',
        RoomName: 'Tiếng Anh giao tiếp',
        TopicName: 'Tiếng Anh',
        HostName: 'Phạm Thị D',
        MaxPlayers: 3,
        CurrentPlayers: 1,
        IsPrivate: false,
        Status: 'waiting',
        CreatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        EndTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 60 minutes from now
        Settings: {
            timeLimit: 90,
            questionCount: 12,
            gameMode: '1vs1'
        }
    },
    {
        RoomCode: 'MNO345',
        RoomName: 'Địa lý thế giới',
        TopicName: 'Địa lý',
        HostName: 'Hoàng Văn E',
        MaxPlayers: 5,
        CurrentPlayers: 3,
        IsPrivate: false,
        Status: 'waiting',
        CreatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 minutes ago
        EndTime: new Date(Date.now() + 35 * 60 * 1000).toISOString(), // 35 minutes from now
        Settings: {
            timeLimit: 75,
            questionCount: 18,
            gameMode: 'battle'
        }
    },
    {
        RoomCode: 'PQR678',
        RoomName: 'Văn học Việt Nam',
        TopicName: 'Ngữ văn',
        HostName: 'Đỗ Thị F',
        MaxPlayers: 4,
        CurrentPlayers: 2,
        IsPrivate: false,
        Status: 'waiting',
        CreatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 minutes ago
        EndTime: new Date(Date.now() + 50 * 60 * 1000).toISOString(), // 50 minutes from now
        Settings: {
            timeLimit: 60,
            questionCount: 14,
            gameMode: '1vs1'
        }
    },
    {
        RoomCode: 'STU901',
        RoomName: 'Phòng riêng cho bạn bè',
        TopicName: 'Kiến thức chung',
        HostName: 'Nguyễn Văn G',
        MaxPlayers: 6,
        CurrentPlayers: 2,
        IsPrivate: true,
        Status: 'waiting',
        CreatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        EndTime: new Date(Date.now() + 40 * 60 * 1000).toISOString(), // 40 minutes from now
        Settings: {
            timeLimit: 45,
            questionCount: 15,
            gameMode: 'battle'
        }
    },
    {
        RoomCode: 'VWX234',
        RoomName: 'Thử thách toán học nâng cao',
        TopicName: 'Toán học',
        HostName: 'Trần Thị H',
        MaxPlayers: 4,
        CurrentPlayers: 1,
        IsPrivate: true,
        Status: 'waiting',
        CreatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
        EndTime: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25 minutes from now
        Settings: {
            timeLimit: 120,
            questionCount: 20,
            gameMode: '1vs1'
        }
    }
];

const useRoomStore = create((set, get) => ({
    // State
    rooms: [],
    loading: false,
    error: null,
    autoRefreshInterval: null,

    // Actions
    loadRooms: async () => {
        set({ loading: true, error: null });

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Set mock data
            set({ rooms: mockRooms, loading: false });
        } catch (error) {
            set({
                error: 'Không thể tải danh sách phòng. Vui lòng thử lại.',
                loading: false
            });
        }
    },

    joinRoom: async (roomCode, isPublic = true) => {
        set({ loading: true, error: null });

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock successful join
            const mockResponse = {
                success: true,
                data: {
                    Code: roomCode,
                    message: 'Tham gia phòng thành công'
                }
            };

            set({ loading: false });
            return mockResponse;
        } catch (error) {
            set({
                error: 'Không thể tham gia phòng. Vui lòng thử lại.',
                loading: false
            });
            return {
                success: false,
                error: 'Không thể tham gia phòng. Vui lòng thử lại.'
            };
        }
    },

    clearError: () => {
        set({ error: null });
    },

    startAutoRefresh: () => {
        const interval = setInterval(() => {
            get().loadRooms();
        }, 30000); // Refresh every 30 seconds

        set({ autoRefreshInterval: interval });
    },

    stopAutoRefresh: () => {
        const { autoRefreshInterval } = get();
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            set({ autoRefreshInterval: null });
        }
    }
}));

export default useRoomStore;