import { FiSave, FiX, FiLoader } from 'react-icons/fi';

const EditActions = ({
    isEditing,
    isChangingPassword,
    updateLoading,
    handleUpdateProfile,
    handleChangePassword,
    setIsEditing,
    setIsChangingPassword,
    setFormErrors
}) => {
    if (!isEditing && !isChangingPassword) return null;

    return (
        <div className="pf-edit-actions">
            <button
                className="pf-save-btn"
                onClick={isEditing ? handleUpdateProfile : handleChangePassword}
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
        </div>
    );
};

export default EditActions;