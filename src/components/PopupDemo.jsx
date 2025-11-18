import { useState } from 'react';
import PopupNotification from './PopupNotification';
import { usePopup } from '../hooks/usePopup';

const PopupDemo = () => {
    const { popup, showSuccess, showError, showWarning, showInfo, showConfirm, hidePopup } = usePopup();

    return (
        <div style={{ padding: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <h2>Demo Popup Notifications</h2>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => showSuccess('Thao tác đã được thực hiện thành công!')}
                    style={{ padding: '0.5rem 1rem', background: '#48bb78', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    Success Popup
                </button>
                
                <button 
                    onClick={() => showError('Có lỗi xảy ra khi thực hiện thao tác!')}
                    style={{ padding: '0.5rem 1rem', background: '#f56565', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    Error Popup
                </button>
                
                <button 
                    onClick={() => showWarning('Cảnh báo: Hành động này có thể ảnh hưởng đến dữ liệu!')}
                    style={{ padding: '0.5rem 1rem', background: '#ed8936', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    Warning Popup
                </button>
                
                <button 
                    onClick={() => showInfo('Thông tin: Tính năng này đang trong giai đoạn phát triển.')}
                    style={{ padding: '0.5rem 1rem', background: '#4299e1', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    Info Popup
                </button>
                
                <button 
                    onClick={() => showConfirm(
                        'Bạn có chắc muốn xóa item này? Hành động này không thể hoàn tác.',
                        () => {
                            showSuccess('Đã xóa thành công!');
                        },
                        'Xác nhận xóa',
                        'Xóa',
                        'Hủy'
                    )}
                    style={{ padding: '0.5rem 1rem', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    Confirm Popup
                </button>
            </div>
            
            <PopupNotification
                type={popup.type}
                title={popup.title}
                message={popup.message}
                isVisible={popup.isVisible}
                onClose={hidePopup}
                showConfirm={popup.showConfirm}
                onConfirm={popup.onConfirm}
                onCancel={popup.onCancel}
                confirmText={popup.confirmText}
                cancelText={popup.cancelText}
            />
        </div>
    );
};

export default PopupDemo;