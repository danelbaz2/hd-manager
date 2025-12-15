import React, { useState } from "react";
import { User, Trash2, Pencil, Plus, Save } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

interface UserData {
  id: string;
  name: string;
  role: string;
  color: string;
}

const AVAILABLE_COLORS = [
  "#FEF3C7", // Yellow
  "#D1FAE5", // Green
  "#DBEAFE", // Blue
  "#E0E7FF", // Indigo
  "#FCE7F3", // Pink
  "#FEE2E2", // Red
  "#F3E8FF", // Purple
  "#ECFEFF", // Cyan
];

const ManageUser: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState<UserData[]>([
    { id: "1", name: "מאור", role: "מנהל מערכת", color: "#DBEAFE" },
    { id: "2", name: "עילי", role: "משתמש", color: "#D1FAE5" },
    { id: "3", name: "דן", role: "בוט", color: "#FCE7F3" },
    { id: "4", name: "אוראל", role: "אבטחה", color: "#FEE2E2" },
    { id: "5", name: "אורי", role: "נינג'ה", color: "#E0E7FF" },
    { id: "6", name: "עדן", role: "בוגר", color: "#F3E8FF" },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    color: AVAILABLE_COLORS[2],
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const handleAddUser = () => {
    if (!formData.name || !formData.role) return;

    const user: UserData = {
      id: Date.now().toString(),
      name: formData.name,
      role: formData.role,
      color: formData.color,
    };

    setUsers([...users, user]);
    setFormData({ name: "", role: "", color: AVAILABLE_COLORS[2] });
  };

  const handleEditUser = (user: UserData) => {
    setEditingUserId(user.id);
    setFormData({ name: user.name, role: user.role, color: user.color });
  };

  const handleSaveEdit = () => {
    if (!formData.name || !formData.role || !editingUserId) return;

    setUsers(
      users.map((user) =>
        user.id === editingUserId
          ? {
              ...user,
              name: formData.name,
              role: formData.role,
              color: formData.color,
            }
          : user
      )
    );

    setEditingUserId(null);
    setFormData({ name: "", role: "", color: AVAILABLE_COLORS[2] });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setFormData({ name: "", role: "", color: AVAILABLE_COLORS[2] });
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
      <div
        className={`
          rounded-xl border p-6 mb-6
          ${
            isDarkMode
              ? "bg-slate-700/50 border-slate-600"
              : "bg-slate-50 border-slate-200"
          }
        `}
      >
        <div className="flex items-center justify-end gap-2 mb-4">
          <span
            className={`font-medium ${
              isDarkMode ? "text-slate-200" : "text-slate-700"
            }`}
          >
            {isEditing ? "עריכת עובד" : "הוספת עובד חדש"}
          </span>
          <User size={18} className="text-slate-400" />
        </div>

        <div className="flex flex-wrap items-center gap-4" dir="rtl">
          {/* Name Input */}
          <input
            type="text"
            placeholder="שם מלא"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`
              flex-1 min-w-[150px] px-4 py-2.5
              rounded-lg border text-right
              transition-colors
              ${
                isDarkMode
                  ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                  : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            `}
          />

          {/* Role Input */}
          <input
            type="text"
            placeholder="תפקיד"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className={`
              flex-1 min-w-[120px] px-4 py-2.5
              rounded-lg border text-right
              transition-colors
              ${
                isDarkMode
                  ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                  : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            `}
          />

          {/* Color Selection */}
          <div className="flex items-center gap-1">
            <span
              className={`text-sm mr-2 ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              צבע
            </span>
            {AVAILABLE_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setFormData({ ...formData, color })}
                className={`
                  w-6 h-6 rounded-full transition-transform
                  ${
                    formData.color === color
                      ? "ring-2 ring-blue-500 ring-offset-2 scale-110"
                      : ""
                  }
                  ${
                    isDarkMode && formData.color === color
                      ? "ring-offset-slate-700"
                      : ""
                  }
                `}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Action Buttons */}
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="
                  flex items-center gap-2
                  px-6 py-2.5 rounded-lg
                  bg-blue-500 hover:bg-blue-600
                  text-white font-medium
                  transition-colors
                "
              >
                <Save size={18} />
                <span>שמור</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className={`
                  px-4 py-2.5 rounded-lg
                  font-medium transition-colors
                  ${
                    isDarkMode
                      ? "bg-slate-600 hover:bg-slate-500 text-slate-200"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                  }
                `}
              >
                ביטול
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddUser}
              className="
                flex items-center gap-2
                px-6 py-2.5 rounded-lg
                bg-blue-500 hover:bg-blue-600
                text-white font-medium
                transition-colors
              "
            >
              <Plus size={18} />
              <span>הוסף</span>
            </button>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className={`
              flex items-center justify-between
              px-5 py-4 rounded-xl border
              transition-colors
              ${
                editingUserId === user.id
                  ? isDarkMode
                    ? "bg-blue-900/20 border-blue-500/50"
                    : "bg-blue-50 border-blue-200"
                  : isDarkMode
                  ? "bg-slate-700/30 border-slate-600 hover:bg-slate-700/50"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }
            `}
          >
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDeleteUser(user.id)}
                className={`
                  p-2 rounded-lg transition-colors
                  ${
                    isDarkMode
                      ? "text-red-400 hover:bg-red-900/30"
                      : "text-red-500 hover:bg-red-50"
                  }
                `}
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={() => handleEditUser(user)}
                className={`
                  p-2 rounded-lg transition-colors
                  ${
                    editingUserId === user.id
                      ? "bg-blue-500 text-white"
                      : isDarkMode
                      ? "text-blue-400 hover:bg-blue-900/30"
                      : "text-blue-500 hover:bg-blue-50"
                  }
                `}
              >
                <Pencil size={18} />
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  {user.name}
                </p>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {user.role}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: user.color }}
              >
                <User size={20} className="text-slate-600" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageUser;
