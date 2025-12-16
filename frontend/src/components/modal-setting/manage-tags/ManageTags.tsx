import React, { useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  type TagData,
  type TagFormData,
  DEFAULT_TAG_FORM,
} from "../../../schemas/tagTypes";
import AddTagForm from "./AddTagForm";
import EditTagForm from "./EditTagForm";
import TagsList from "./TagsList";

const ManageTags: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [tags, setTags] = useState<TagData[]>([
    { id: "1", name: "פיתוח", color: "#DBEAFE" },
    { id: "2", name: "עיצוב", color: "#FEF3C7" },
    { id: "3", name: "שרתים", color: "#E0E7FF" },
    { id: "4", name: "בדיקות", color: "#FEE2E2" },
    { id: "5", name: "דחיפות גבוהה", color: "#FCE7F3" },
    { id: "6", name: "ניהול", color: "#DBEAFE" },
  ]);

  const [formData, setFormData] = useState<TagFormData>(DEFAULT_TAG_FORM);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  const handleAddTag = (newTagData: TagFormData) => {
    const tag: TagData = {
      id: Date.now().toString(),
      name: newTagData.name,
      color: newTagData.color,
    };
    setTags([...tags, tag]);
  };

  const handleEditTag = (tag: TagData) => {
    setEditingTagId(tag.id);
    setFormData({
      name: tag.name,
      color: tag.color,
    });
  };

  const handleSaveEdit = () => {
    if (editingTagId) {
      setTags(
        tags.map((tag) =>
          tag.id === editingTagId ? { ...tag, ...formData } : tag
        )
      );
    }
    setEditingTagId(null);
    setFormData(DEFAULT_TAG_FORM);
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setFormData(DEFAULT_TAG_FORM);
  };

  const handleDeleteTag = (id: string) => {
    setTags(tags.filter((tag) => tag.id !== id));
    if (editingTagId === id) {
      handleCancelEdit();
    }
  };

  const isEditing = editingTagId !== null;

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      {/* Header */}
      <h1
        className={`
          text-2xl font-bold text-center mb-8
          ${isDarkMode ? "text-white" : "text-slate-800"}
        `}
      >
        ניהול תגיות משימה
      </h1>

      {/* Add or Edit Tag Form */}
      {isEditing ? (
        <EditTagForm
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      ) : (
        <AddTagForm onAdd={handleAddTag} />
      )}

      {/* Tags List */}
      <TagsList
        tags={tags}
        editingTagId={editingTagId}
        onEdit={handleEditTag}
        onDelete={handleDeleteTag}
      />
    </div>
  );
};

export default ManageTags;
