// Contact Modal Content - displays contact details with tags
import React, { useEffect, useState } from "react";
import { Phone, Building2 } from "lucide-react";
import type { Contact } from "../../../api/contactsApi";
import {
  getAllPrimaryTags,
  type PrimaryTag,
} from "../../../api/primaryTagsApi";
import { getTextColor } from "../../../schemas/tagTypes";
import { TagBadge } from "../../tags-tooltip";

interface ContactModalContentProps {
  contact: Contact;
  isDarkMode: boolean;
}

interface DetailCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg: string;
  isDarkMode: boolean;
}

const DetailCard: React.FC<DetailCardProps> = ({
  icon,
  label,
  value,
  iconBg,
  isDarkMode,
}) => (
  <div
    className={`flex items-center gap-4 p-4 rounded-2xl transition-all
    ${
      isDarkMode
        ? "bg-slate-700/50 hover:bg-slate-700/70"
        : "bg-slate-50 hover:bg-slate-100"
    }`}
  >
    <div className={`p-3 rounded-xl ${iconBg}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <p
        className={`text-xs font-medium ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {label}
      </p>
      <p
        className={`font-semibold text-base truncate ${
          isDarkMode ? "text-white" : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

export const ContactModalContent: React.FC<ContactModalContentProps> = ({
  contact,
  isDarkMode,
}) => {
  const [tags, setTags] = useState<PrimaryTag[]>([]);

  // Fetch tags on mount
  useEffect(() => {
    const loadTags = async () => {
      const response = await getAllPrimaryTags();
      if (response.success && response.data) {
        setTags(response.data);
      }
    };
    loadTags();
  }, []);

  // Get tags that belong to this contact
  const contactTags = tags.filter((tag) =>
    contact.primaryTagIds?.includes(tag.id)
  );

  return (
    <div className="pb-4 px-6">
      {/* Name & Position */}
      <div className="mb-4 text-center">
        <h3
          className={`text-2xl font-bold mb-2 ${
            isDarkMode ? "text-white" : "text-slate-800"
          }`}
        >
          {contact.fullName}
        </h3>
      </div>

      {/* Tags Display */}
      {contactTags.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {contactTags.map((tag) => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              color={tag.color}
              textColor={getTextColor(tag.color)}
              description={tag.description}
              size="md"
            />
          ))}
        </div>
      )}

      {/* Details Cards */}
      <div className="space-y-3">
        {contact.position && (
          <DetailCard
            icon={<Building2 className="w-5 h-5 text-blue-500" />}
            label="תפקיד/תיאור"
            value={contact.position}
            iconBg="bg-blue-500/20"
            isDarkMode={isDarkMode}
          />
        )}

        {contact.phoneNumber && (
          <DetailCard
            icon={<Phone className="w-5 h-5 text-green-500" />}
            label="טלפון"
            value={contact.phoneNumber}
            iconBg="bg-green-500/20"
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
};
