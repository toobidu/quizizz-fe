import { useEffect } from 'react';
import useRoomStore from '../stores/useRoomStore';
import webSocketManager from '../utils/webSocketManager';

/**
 * Hook để quản lý WebSocket lifecycle
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
        reconnect: () => webSocketManager.reconnect(),
        isConnected: () => webSocketManager.isConnected(),
        disconnect: () => cleanup()
    };
};

export default useWebSocketCleanup;