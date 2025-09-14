import { FiX, FiSave, FiLoader } from 'react-icons/fi';

const ConfirmModal = ({
    showConfirmModal,
    previewUrl,
    confirmLoading,
    handleCancelCrop,
    handleConfirmUpload
}) => {
    if (!showConfirmModal) return null;

    return (
        <div className="pf-confirm-modal-overlay">
            <div className="pf-confirm-modal">
                <div className="pf-confirm-modal-header">
                    <h3>Xác nhận cập nhật avatar</h3>
                </div>
                <div className="pf-confirm-modal-body">
                    <div className="pf-confirm-preview">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Avatar preview"
                                className="pf-confirm-preview-img"
                            />
                        ) : (
                            <div className="pf-confirm-preview-loading">
                                <FiLoader className="pf-spin" />
                                <p>Đang tạo preview...</p>
                            </div>
                        )}
                    </div>
                    <p className="pf-confirm-text">
                        Bạn có chắc chắn muốn cập nhật avatar với ảnh này không?
                    </p>
                </div>
                <div className="pf-confirm-modal-footer">
                    <button
                        className="pf-confirm-cancel-btn"
                        onClick={handleCancelCrop}
                        disabled={confirmLoading}
                    >
                        Hủy
                    </button>
                    <button
                        className="pf-confirm-save-btn"
                        onClick={handleConfirmUpload}
                        disabled={confirmLoading}
                    >
                        {confirmLoading ? (
                            <>
                                <FiLoader className="pf-spin" />
                                Đang tải...
                            </>
                        ) : (
                            <>
                                <FiSave />
                                Xác nhận
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;