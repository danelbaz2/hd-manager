import React, { useState, useMemo } from "react";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useUsersQuery } from "../../../../api/queries";
import { mapUsersToUserData } from "../../../../api/typeMappers";
import { type UserData } from "../../../../schemas/userTypes";
import DelayedLoader from "../../../loaders/DelayedLoader";
import { ConfirmModal } from "../../modal-confirm";
import { UserCard } from "./components";

interface UsersListProps {
  editingUserId: string | null;
  onEdit: (user: UserData) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
}

/**
 * UsersList - Displays list of users with edit/delete functionality
 */
const UsersList: React.FC<UsersListProps> = ({
  editingUserId,
  onEdit,
  onCancelEdit,
  onDelete,
}) => {
  const { isDarkMode } = useTheme();
  const { data: usersData = [], isLoading: isLoadingUsers } = useUsersQuery();
  const users = useMemo(() => mapUsersToUserData(usersData), [usersData]);
  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null);

  const handleDeleteRequest = (user: UserData) => {
    setDeleteTarget(user);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="מחיקת משתמש"
        text={
          <>
            האם אתה בטוח שברצונך למחוק את המשתמש
            <span className="font-semibold"> {deleteTarget?.fullName}</span>?
          </>
        }
        isDarkMode={isDarkMode}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
        showIrreversibleWarning
      />

      <DelayedLoader isLoading={isLoadingUsers} delay={300}>
        {users.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <p
              className={`text-center ${isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
            >
              אין משתמשים להצגה
            </p>
          </div>
        ) : (
          <div
            className={`flex-1 overflow-y-auto space-y-3 ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"
              }`}
          >
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isEditing={editingUserId === user.id}
                isDarkMode={isDarkMode}
                onEdit={onEdit}
                onCancelEdit={onCancelEdit}
                onDeleteRequest={handleDeleteRequest}
              />
            ))}
          </div>
        )}
      </DelayedLoader>
    </>
  );
};

export default UsersList;
