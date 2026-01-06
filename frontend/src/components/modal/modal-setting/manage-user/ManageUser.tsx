import React, { useState } from "react";
import { useTheme } from "../../../../contexts/ThemeContext";
import { invalidateUserQueries } from "../../../../api/queries";
import {
  type UserData,
  type UserFormData,
  DEFAULT_FORM_DATA,
} from "../../../../schemas/userTypes";
import { deleteUser } from "../../../../api/usersApi";
import { ToastContainer, useToast } from "../../../alert-feedback";
import AddUserForm from "./AddUserForm";
import EditUserForm from "./EditUserForm";
import UsersList from "./UsersList";

const ManageUser: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<UserFormData>(DEFAULT_FORM_DATA);
  const [originalData, setOriginalData] =
    useState<UserFormData>(DEFAULT_FORM_DATA);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const { alerts, showSuccess, showError, dismissAlert } = useToast();

  const handleAddUser = () => {
    // Reset form - WebSocket already handles the users list update
    setFormData(DEFAULT_FORM_DATA);
  };

  const handleEditUser = (user: UserData) => {
    const userData: UserFormData = {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      password: "",
      role: user.role,
      color: user.color,
      profileImage: user.profileImage,
    };
    setEditingUserId(user.id);
    setFormData(userData);
    setOriginalData(userData);
  };

  const handleSaveEdit = () => {
    setEditingUserId(null);
    setFormData(DEFAULT_FORM_DATA);
    setOriginalData(DEFAULT_FORM_DATA);
    invalidateUserQueries();
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setFormData(DEFAULT_FORM_DATA);
    setOriginalData(DEFAULT_FORM_DATA);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const response = await deleteUser(id);

      if (response.success) {
        showSuccess("הצלחה", "המשתמש נמחק בהצלחה");
        if (editingUserId === id) {
          handleCancelEdit();
        }
        invalidateUserQueries();
      } else {
        showError("שגיאה", response.error || "שגיאה במחיקת המשתמש");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showError("שגיאה", "אירעה שגיאה בלתי צפויה");
    }
  };

  const isEditing = editingUserId !== null;

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      {/* Toast Notifications */}
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />

      {/* Header */}
      <h1
        className={`
          text-2xl font-bold text-center mb-8
          ${isDarkMode ? "text-white" : "text-slate-800"}
        `}
      >
        ניהול עובדים
      </h1>

      {/* Add or Edit User Form */}
      {isEditing ? (
        <EditUserForm
          formData={formData}
          originalData={originalData}
          setFormData={setFormData}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      ) : (
        <AddUserForm
          formData={formData}
          setFormData={setFormData}
          onAdd={handleAddUser}
        />
      )}

      {/* Users List - now uses context */}
      <UsersList
        editingUserId={editingUserId}
        onEdit={handleEditUser}
        onCancelEdit={handleCancelEdit}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};

export default ManageUser;
