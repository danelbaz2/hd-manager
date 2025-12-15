import React, { useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  type UserData,
  type UserFormData,
  DEFAULT_FORM_DATA,
} from "../../../schemas/userentity";
import UserForm from "./UserForm";
import UsersList from "./UsersList";

const ManageUser: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState<UserData[]>([
    {
      id: "1",
      name: "מאור",
      username: "maor",
      password: "123456",
      isAdmin: true,
      color: "#DBEAFE",
    },
    {
      id: "2",
      name: "עילי",
      username: "ili",
      password: "123456",
      isAdmin: false,
      color: "#D1FAE5",
    },
    {
      id: "3",
      name: "דן",
      username: "dan",
      password: "123456",
      isAdmin: false,
      color: "#FCE7F3",
    },
    {
      id: "4",
      name: "אוראל",
      username: "oral",
      password: "123456",
      isAdmin: false,
      color: "#FEE2E2",
    },
    {
      id: "5",
      name: "אורי",
      username: "ori",
      password: "123456",
      isAdmin: false,
      color: "#E0E7FF",
    },
    {
      id: "6",
      name: "עדן",
      username: "eden",
      password: "123456",
      isAdmin: false,
      color: "#F3E8FF",
    },
  ]);

  const [formData, setFormData] = useState<UserFormData>(DEFAULT_FORM_DATA);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const handleAddUser = () => {
    if (!formData.name || !formData.username || !formData.password) return;

    const user: UserData = {
      id: Date.now().toString(),
      name: formData.name,
      username: formData.username,
      password: formData.password,
      isAdmin: formData.isAdmin,
      color: formData.color,
    };

    setUsers([...users, user]);
    setFormData(DEFAULT_FORM_DATA);
  };

  const handleEditUser = (user: UserData) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      username: user.username,
      password: user.password,
      isAdmin: user.isAdmin,
      color: user.color,
    });
  };

  const handleSaveEdit = () => {
    if (
      !formData.name ||
      !formData.username ||
      !formData.password ||
      !editingUserId
    )
      return;

    setUsers(
      users.map((user) =>
        user.id === editingUserId
          ? {
              ...user,
              name: formData.name,
              username: formData.username,
              password: formData.password,
              isAdmin: formData.isAdmin,
              color: formData.color,
            }
          : user
      )
    );

    setEditingUserId(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id));
    // If we're editing this user, cancel the edit
    if (editingUserId === id) {
      handleCancelEdit();
    }
  };

  const isEditing = editingUserId !== null;

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      {/* Header */}
      <h1
        className={`
          text-2xl font-bold text-center mb-8
          ${isDarkMode ? "text-white" : "text-slate-800"}
        `}
      >
        ניהול עובדים
      </h1>

      {/* Add/Edit User Form */}
      <UserForm
        formData={formData}
        setFormData={setFormData}
        isEditing={isEditing}
        onAdd={handleAddUser}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />

      {/* Users List */}
      <UsersList
        users={users}
        editingUserId={editingUserId}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};

export default ManageUser;
