import React, { useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  type UserData,
  type UserFormData,
  DEFAULT_FORM_DATA,
} from "../../../schemas/userentity";
import { deleteUser } from "../../../api/usersApi";
import { ToastContainer, useToast } from "../../alert-feedback";
import AddUserForm from "./AddUserForm";
import EditUserForm from "./EditUserForm";
import UsersList from "./UsersList";

const ManageUser: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<UserFormData>(DEFAULT_FORM_DATA);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { alerts, showSuccess, showError, dismissAlert } = useToast();

  // Trigger a refresh of the users list
  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleAddUser = () => {
    // Reset form and refresh the list
    setFormData(DEFAULT_FORM_DATA);
    triggerRefresh();
  };

  const handleEditUser = (user: UserData) => {
    setEditingUserId(user.id);
    setFormData({
      id: user.id, // Include user id for API updates
      fullName: user.fullName,
      username: user.username,
      passwordHash: "", // Don't show existing password
      role: user.role,
      color: user.color,
      profileImage: user.profileImage,
    });
  };

  const handleSaveEdit = () => {
    // API call is handled by EditUserForm
    // Just reset state and refresh list
    setEditingUserId(null);
    setFormData(DEFAULT_FORM_DATA);
    triggerRefresh();
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const response = await deleteUser(id);

      if (response.success) {
        showSuccess("הצלחה", "המשתמש נמחק בהצלחה");
        // If we're editing this user, cancel the edit
        if (editingUserId === id) {
          handleCancelEdit();
        }
        triggerRefresh();
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

      {/* Users List */}
      <UsersList
        editingUserId={editingUserId}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export default ManageUser;
