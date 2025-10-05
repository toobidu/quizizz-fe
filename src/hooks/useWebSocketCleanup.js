import { useEffect } from 'react';
import useRoomStore from '../stores/useRoomStore';
import socketManager from '../utils/socketManager';

/**
 * Hook để quản lý Socket.IO lifecycle
 * Tự động cleanup khi component unmount
 */
export const useWebSocketCleanup = () => {
    const cleanup = useRoomStore(state => state.cleanup);

    useEffect(() => {
        // Cleanup function sẽ được gọi khi component unmount
        return () => {
            cleanup();
        };
    }, [cleanup]);

    // Return utility functions
    return {
        reconnect: () => socketManager.reconnect(),
        isConnected: () => socketManager.isConnected(),
        disconnect: () => cleanup()
    };
};

export default useWebSocketCleanup;