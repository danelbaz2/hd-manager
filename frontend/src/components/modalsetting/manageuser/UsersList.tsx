import React from "react";
import { Trash2, Pencil } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { type UserData } from "../../../schemas/userentity";
import defaultProfileImage from "../../../assets/defualt-profile.jpg";

interface UsersListProps {
  users: UserData[];
  editingUserId: string | null;
  onEdit: (user: UserData) => void;
  onDelete: (id: string) => void;
}

const UsersList: React.FC<UsersListProps> = ({
  users,
  editingUserId,
  onEdit,
  onDelete,
}) => {
  const { isDarkMode } = useTheme();

  return (
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
              onClick={() => onDelete(user.id)}
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
              onClick={() => onEdit(user)}
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
                @{user.username}
              </p>
            </div>
            <span
              className={`
                px-2 py-0.5 rounded-full text-xs font-medium
                ${
                  user.isAdmin
                    ? isDarkMode
                      ? "bg-blue-900/50 text-blue-300"
                      : "bg-blue-100 text-blue-700"
                    : isDarkMode
                    ? "bg-slate-600 text-slate-300"
                    : "bg-slate-200 text-slate-600"
                }
              `}
            >
              {user.isAdmin ? "מנהל" : "משתמש"}
            </span>
            <div
              className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
              style={{ backgroundColor: user.color }}
            >
              <img
                src={user.profileImage || defaultProfileImage}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersList;
