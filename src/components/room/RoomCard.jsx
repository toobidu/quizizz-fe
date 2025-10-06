import React, { useState } from 'react';
import { IoPeople, IoTime, IoPlay } from 'react-icons/io5';
import { FiUser, FiHash, FiLock, FiUnlock } from 'react-icons/fi';
import useRoomStore from '../../stores/useRoomStore';
import '../../styles/components/room/RoomCard.css';

const RoomCard = ({ room, onJoinPublic }) => {
  const { animatingRooms, newRoomIds } = useRoomStore();
  const [isJoining, setIsJoining] = useState(false);

  const isAnimating = animatingRooms.has(room.id);
  const isNew = newRoomIds.has(room.id);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'waiting': return '#10b981';
      case 'playing': return '#f59e0b';
      case 'finished': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'waiting': return 'Sẵn sàng';
      case 'playing': return 'Đang chơi';
      case 'finished': return 'Đã kết thúc';
      default: return 'Không xác định';
    }
  };

  const getGameModeText = (gameMode) => {
    return gameMode?.toLowerCase() === 'one_vs_one' ? '1 vs 1' : 'Battle Royale';
  };

  const handleJoin = async () => {
    setIsJoining(true);
    await onJoinPublic(room.roomCode);
    setIsJoining(false);
  };

  return (
    <div className={`room-card ${isAnimating ? 'animating' : ''} ${isNew ? 'new-room' : ''}`}>
      {isNew && <div className="new-room-badge">MỚI</div>}
      <div className="room-card-header">
        <div className="room-card-main-info">
          <h3 className="room-card-title">{room.roomName}</h3>
          <div className="room-card-meta">
            <div className="room-card-status">
              <div
                className="room-card-status-dot"
                style={{ backgroundColor: getStatusColor(room.status) }}
              ></div>
              <span>{getStatusText(room.status)}</span>
            </div>
            <div className="room-card-privacy">
              {room.isPrivate ? <FiLock /> : <FiUnlock />}
              <span>{room.isPrivate ? 'Riêng tư' : 'Công khai'}</span>
            </div>
          </div>
        </div>

        {!room.isPrivate && room.roomCode && (
          <div className="room-card-code">
            <FiHash />
            <span>{room.roomCode}</span>
          </div>
        )}
      </div>

      <div className="room-card-content">
        <div className="room-card-details">
          <div className="room-card-detail-item">
            <span className="room-card-detail-label">Chủ đề:</span>
            <span className="room-card-detail-value">{room.topicName || 'Chưa xác định'}</span>
          </div>
          <div className="room-card-detail-item">
            <span className="room-card-detail-label">Chế độ:</span>
            <span className="room-card-detail-value">{getGameModeText(room.roomMode)}</span>
          </div>
          <div className="room-card-detail-item">
            <IoPeople />
            <span className="room-card-detail-label">Người chơi:</span>
            <span className="room-card-detail-value">
              {room.currentPlayers || 0}/{room.maxPlayers}
            </span>
          </div>
        </div>
      </div>

      <div className="room-card-footer">
        <button
          className="room-card-join-btn"
          onClick={handleJoin}
          disabled={room.status?.toLowerCase() !== 'waiting' || isJoining}
        >
          {isJoining ? (
            <span className="loading-spinner">Đang tham gia...</span>
          ) : (
            <>
              <IoPlay />
              <span>Tham gia</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default RoomCard;