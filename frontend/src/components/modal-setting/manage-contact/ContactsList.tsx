import React, { useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { type ContactData } from "../../../schemas/contactTypes";
import { type PrimaryTagData } from "../../../schemas/tagTypes";
import DelayedLoader from "../../loaders/DelayedLoader";
import { ConfirmModal } from "../../confirm-modal";
import { ContactCard } from "./components";

interface ContactsListProps {
  contacts: ContactData[];
  tags: PrimaryTagData[];
  editingContactId?: string | null;
  onEdit?: (contact: ContactData) => void;
  onCancelEdit?: () => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

/**
 * ContactsList - Displays list of contacts with edit/delete functionality
 * Refactored to use ContactCard shared component
 */
const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  tags,
  editingContactId,
  onEdit,
  onCancelEdit,
  onDelete,
  isLoading = false,
}) => {
  const { isDarkMode } = useTheme();
  const [deleteTarget, setDeleteTarget] = useState<ContactData | null>(null);

  const handleDeleteRequest = (contact: ContactData) => {
    setDeleteTarget(contact);
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
        title="מחיקת איש קשר"
        text={
          <>
            האם אתה בטוח שברצונך למחוק את איש הקשר
            <span className="font-semibold"> {deleteTarget?.name}</span>?
          </>
        }
        isDarkMode={isDarkMode}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
        showIrreversibleWarning
      />

      <DelayedLoader isLoading={isLoading} delay={300}>
        {contacts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <p
              className={`text-center ${isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
            >
              אין אנשי קשר להצגה
            </p>
          </div>
        ) : (
          <div
            className={`flex-1 overflow-y-auto space-y-3 ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"
              }`}
          >
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                tags={tags}
                isEditing={editingContactId === contact.id}
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

export default ContactsList;
