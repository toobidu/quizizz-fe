// Helper functions for room data mapping
export const mapRoomFromBackend = (backendRoom) => {
    if (!backendRoom) return null;

    console.log('roomUtils - Mapping backend room:', backendRoom);

    return {
        // Primary identifiers
        id: backendRoom.id,
        roomCode: backendRoom.roomCode,
        Code: backendRoom.roomCode, // For frontend compatibility  
        code: backendRoom.roomCode,

        // Room details
        roomName: backendRoom.roomName,
        RoomName: backendRoom.roomName,
        name: backendRoom.roomName, // alias for consistency

        // Topic information
        topicId: backendRoom.topicId,
        topicName: backendRoom.topicName,
        TopicName: backendRoom.topicName,

        // Owner/Host information
        ownerId: backendRoom.ownerId,
        hostId: backendRoom.ownerId, // alias for consistency
        HostName: backendRoom.ownerUsername,
        hostName: backendRoom.ownerUsername,

        // Player counts
        maxPlayers: backendRoom.maxPlayers,
        MaxPlayers: backendRoom.maxPlayers,
        currentPlayers: backendRoom.currentPlayers,
        CurrentPlayers: backendRoom.currentPlayers,

        // Room settings
        isPrivate: backendRoom.isPrivate,
        IsPrivate: backendRoom.isPrivate,
        roomMode: backendRoom.roomMode,
        questionCount: backendRoom.questionCount,
        countdownTime: backendRoom.countdownTime,

        // Status
        status: backendRoom.status?.toLowerCase() || 'waiting',
        Status: backendRoom.status || 'WAITING',

        // Timestamps
        createdAt: backendRoom.createdAt,
        CreatedAt: backendRoom.createdAt,

        // Settings object for UI compatibility
        Settings: {
            timeLimit: backendRoom.countdownTime,
            questionCount: backendRoom.questionCount,
            gameMode: backendRoom.roomMode
        }
    };
};

export const mapRoomsFromBackend = (backendRooms) => {
    if (!Array.isArray(backendRooms)) return [];
    return backendRooms.map(mapRoomFromBackend).filter(room => room !== null);
};

export const mapCreateRoomRequest = (frontendData) => {
    console.log('roomUtils - Mapping create room request:', frontendData);

    return {
        roomName: frontendData.roomName,
        roomMode: frontendData.roomMode || frontendData.gameMode,
        topicId: parseInt(frontendData.topicId),
        isPrivate: frontendData.isPrivate || false,
        maxPlayers: parseInt(frontendData.maxPlayers),
        questionCount: parseInt(frontendData.questionCount),
        countdownTime: parseInt(frontendData.countdownTime || frontendData.timeLimit)
    };
};