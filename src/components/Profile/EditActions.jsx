import { FiSave, FiX, FiLoader, FiLock } from 'react-icons/fi';
import '../../styles/components/profile/EditActions.css';

const EditActions = ({
    isEditing,
    isChangingPassword,
    updateLoading,
    handleUpdateProfile,
    handleOpenPasswordModal,
    setIsEditing,
    setIsChangingPassword,
    setFormErrors
}) => {
    return (
        <div className="pf-edit-actions">

            {/* Chỉ hiển thị nút Lưu và Hủy khi đang edit profile */}
            {isEditing && (
                <>
                    <button
                        className="pf-save-btn"
                        onClick={handleUpdateProfile}
                        disabled={updateLoading}
                    >
                        {updateLoading ? <FiLoader className="pf-spin" /> : <FiSave />} Lưu
                    </button>
                    <button
                        className="pf-cancel-btn"
                        onClick={() => {
                            setIsEditing(false);
                            setIsChangingPassword(false);
                            setFormErrors({});
                        }}
                        disabled={updateLoading}
                    >
                        <FiX /> Hủy
                    </button>
                </>
            )}
        </div>
    );
};

export default EditActions;