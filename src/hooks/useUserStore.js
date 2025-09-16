import { create } from 'zustand';

// Mock user data
const mockUser = {
    id: 1,
    username: 'TestUser',
    email: 'test@example.com',
    avatar: null,
    stats: {
        gamesPlayed: 25,
        highScore: 1250,
        rank: 15,
        medals: 8,
        points: 2450,
        streak: 5
    },
    isAuthenticated: true
};

const useUserStore = create((set, get) => ({
    // State
    user: mockUser,
    userName: mockUser.username,
    isAuthenticated: true,
    isLoading: false,
    error: null,

    // Actions
    login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            set({
                user: mockUser,
                userName: mockUser.username,
                isAuthenticated: true,
                isLoading: false
            });

            return { success: true };
        } catch (error) {
            set({
                error: 'Đăng nhập thất bại',
                isLoading: false
            });
            return { success: false, error: 'Đăng nhập thất bại' };
        }
    },

    logout: (navigate) => {
        set({
            user: null,
            userName: '',
            isAuthenticated: false
        });

        if (navigate) {
            navigate('/');
        }
    },

    updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const updatedUser = { ...get().user, ...profileData };
            set({
                user: updatedUser,
                userName: updatedUser.username,
                isLoading: false
            });

            return { success: true };
        } catch (error) {
            set({
                error: 'Cập nhật thất bại',
                isLoading: false
            });
            return { success: false, error: 'Cập nhật thất bại' };
        }
    },

    clearError: () => {
        set({ error: null });
    }
}));

export default useUserStore;