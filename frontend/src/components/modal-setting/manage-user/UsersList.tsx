import React, { useState, useEffect } from "react";
import { Trash2, Pencil, Loader2 } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { type UserData } from "../../../schemas/userentity";
import defaultProfileImage from "../../../assets/defualt-profile.jpg";
import { getAllUsers, type User } from "../../../api/usersApi";

interface UsersListProps {
  editingUserId: string | null;
  onEdit: (user: UserData) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number; // Optional prop to trigger refresh
}

// Helper function to convert API User to UserData
const mapUserToUserData = (user: User): UserData => ({
  id: user.entityId,
  fullName: user.fullName,
  username: user.username,
  passwordHash: "", // Password is not returned from API
  role: user.role as "admin" | "regular",
  color: user.color,
  profileImage: user.profileImage,
});

const UsersList: React.FC<UsersListProps> = ({
  editingUserId,
  onEdit,
  onDelete,
  refreshTrigger = 0,
}) => {
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await getAllUsers();
        if (response.success && response.data) {
          const mappedUsers = response.data.map(mapUserToUserData);
          setUsers(mappedUsers);
        } else {
          console.error("Failed to fetch users:", response.error);
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <Loader2
          size={32}
          className={`animate-spin ${
            isDarkMode ? "text-blue-400" : "text-blue-500"
          }`}
        />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <p
          className={`text-center ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          אין משתמשים להצגה
        </p>
      </div>
    );
  }

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
                {user.fullName}
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
                  user.role === "admin"
                    ? isDarkMode
                      ? "bg-blue-900/50 text-blue-300"
                      : "bg-blue-100 text-blue-700"
                    : isDarkMode
                    ? "bg-slate-600 text-slate-300"
                    : "bg-slate-200 text-slate-600"
                }
              `}
            >
              {user.role === "admin" ? "מנהל" : "משתמש"}
            </span>
            <div
              className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
              style={{ backgroundColor: user.color }}
            >
              <img
                src={user.profileImage || defaultProfileImage}
                alt={user.fullName}
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
