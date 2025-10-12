import React from 'react';
import '../../styles/components/room/CompletionPopup.css';

/**
 * CompletionPopup - Popup khi player hoàn thành tất cả câu hỏi
 */
const CompletionPopup = ({ onClose }) => {
    React.useEffect(() => {
        // Không tự động đóng - để player xem cho đến khi game kết thúc
        // onClose sẽ được gọi khi chuyển sang màn hình kết quả
    }, []);

    return (
        <div className="completion-overlay">
            <div className="completion-popup">
                {/* Confetti */}
                <div className="confetti-container">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="confetti-piece"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)]
                            }}
                        />
                    ))}
                </div>

                <div className="completion-content">
                    <div className="completion-icon">🎉</div>
                    <h2 className="completion-title">Hoàn Thành!</h2>
                    <p className="completion-message">
                        Bạn đã trả lời xong tất cả câu hỏi!
                    </p>
                    <div className="completion-emoji">✨ 🎊 ✨</div>
                    <p className="completion-waiting">
                        Đang chờ các người chơi khác...
                    </p>
                    <div className="completion-loader">
                        <div className="loader-dot"></div>
                        <div className="loader-dot"></div>
                        <div className="loader-dot"></div>
                    </div>
                </div>

                {onClose && (
                    <button className="completion-close" onClick={onClose}>
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

export default CompletionPopup;

