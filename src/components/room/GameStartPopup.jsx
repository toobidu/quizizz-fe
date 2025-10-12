import React from 'react';
import '../../styles/components/room/GameStartPopup.css';

/**
 * GameStartPopup - Popup thông báo khi game bắt đầu
 */
const GameStartPopup = ({ onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onClose?.();
        }, 2500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="game-start-overlay">
            <div className="game-start-popup">
                <div className="game-start-icon">🎮</div>
                <h2 className="game-start-title">Game Bắt Đầu!</h2>
                <p className="game-start-message">Chúc bạn may mắn! 🍀</p>
                <div className="game-start-loader">
                    <div className="loader-bar"></div>
                </div>
            </div>
        </div>
    );
};

export default GameStartPopup;

