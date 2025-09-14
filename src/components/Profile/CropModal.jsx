import { FiX, FiSave, FiLoader } from 'react-icons/fi';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const CropModal = ({
    showCropModal,
    selectedImage,
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    imageRef,
    previewUrl,
    uploadError,
    setUploadError,
    handleCancelCrop,
    handleCropAndUpload,
    uploadingAvatar
}) => {
    if (!showCropModal) return null;

    return (
        <div className="pf-crop-modal-overlay">
            <div className="pf-crop-modal">
                <div className="pf-crop-modal-header">
                    <h3>Cắt ảnh đại diện</h3>
                    <button
                        className="pf-crop-modal-close"
                        onClick={handleCancelCrop}
                    >
                        <FiX />
                    </button>
                </div>
                <div className="pf-crop-modal-body">
                    {uploadError && (
                        <div className="pf-crop-error">
                            <span>{uploadError}</span>
                            <button
                                className="pf-crop-error-close"
                                onClick={() => setUploadError('')}
                            >
                                <FiX />
                            </button>
                        </div>
                    )}
                    <div className="pf-crop-body-content">
                        <div className="pf-crop-container">
                            <ReactCrop
                                src={selectedImage}
                                crop={crop}
                                onChange={(newCrop) => {
                                    setCrop(newCrop);
                                }}
                                onComplete={(c) => {
                                    setCompletedCrop(c);
                                }}
                                aspect={1}
                                circularCrop
                            >
                                <img
                                    ref={(ref) => {
                                        imageRef.current = ref;
                                    }}
                                    src={selectedImage}
                                    alt="Crop preview"
                                    className="pf-crop-image"
                                    onLoad={(e) => {
                                        imageRef.current = e.target;
                                    }}
                                    onError={(e) => {
                                        setUploadError('Không thể tải ảnh để crop');
                                    }}
                                />
                            </ReactCrop>
                        </div>
                        <div className="pf-crop-preview">
                            <h4>Xem trước</h4>
                            {previewUrl ? (
                                <div className="pf-crop-preview-circle">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="pf-crop-preview-img"
                                    />
                                </div>
                            ) : completedCrop ? (
                                <div className="pf-crop-preview-circle">
                                    <div className="pf-crop-preview-loading">
                                        <FiLoader className="pf-spin" />
                                    </div>
                                </div>
                            ) : (
                                <div className="pf-crop-preview-circle">
                                    <p className="pf-crop-preview-placeholder">Hãy chọn vùng cắt</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="pf-crop-modal-footer">
                    <button
                        className="pf-crop-cancel-btn"
                        onClick={handleCancelCrop}
                    >
                        Hủy
                    </button>
                    <button
                        className="pf-crop-save-btn"
                        onClick={handleCropAndUpload}
                        disabled={!completedCrop || uploadingAvatar}
                    >
                        {uploadingAvatar ? <FiLoader className="pf-spin" /> : <FiSave />}
                        {uploadingAvatar ? 'Đang tải...' : 'Lưu ảnh'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CropModal;