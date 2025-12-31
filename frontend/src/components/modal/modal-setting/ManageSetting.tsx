import React, { useState } from "react";
import { X, Settings, Users, UserPlus, Tag, UserCog } from "lucide-react";
import { useTheme } from "../../../contexts";
import { ModalOverlay } from "../../common/ModalOverlay";
import ManageUser from "./manage-user/ManageUser.tsx";
import ManageContact from "./manage-contact/ManageContact.tsx";
import ManageTagsTwoTier from "./manage-tags";
import { ProfileSettings } from "./profile-settings";

interface ManageSettingProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "users" | "contacts" | "tags" | "profile";

const ManageSetting: React.FC<ManageSettingProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("users");

  const tabs = [
    { id: "users" as TabType, label: "עובדים", icon: Users },
    { id: "contacts" as TabType, label: "אנשי קשר", icon: UserPlus },
    { id: "tags" as TabType, label: "תגיות", icon: Tag },
    { id: "profile" as TabType, label: "פרופיל", icon: UserCog },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <ManageUser />;
      case "contacts":
        return <ManageContact />;
      case "tags":
        return <ManageTagsTwoTier />;
      case "profile":
        return <ProfileSettings />;
      default:
        return <ManageUser />;
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-5xl">
      {/* Modal Container - keeps original size */}
      <div
        className={`
            relative flex
            w-full h-[85vh]
            rounded-2xl shadow-2xl overflow-hidden
            ${isDarkMode ? "bg-slate-800" : "bg-white"}
          `}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`
              absolute top-4 left-4 z-10
              p-2 rounded-lg transition-colors
              ${isDarkMode
              ? "hover:bg-slate-700 text-slate-400"
              : "hover:bg-slate-100 text-slate-500"
            }
            `}
        >
          <X size={24} />
        </button>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderContent()}
        </div>

        {/* Right Sidebar */}
        <div
          className={`
              w-56 shrink-0
              border-l
              p-6
              flex flex-col
              ${isDarkMode
              ? "bg-slate-900 border-slate-700"
              : "bg-slate-50 border-slate-200"
            }
            `}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-end gap-2 mb-8">
            <h2
              className={`
                  text-lg font-bold
                  ${isDarkMode ? "text-white" : "text-slate-800"}
                `}
            >
              הגדרות מערכת
            </h2>
            <Settings size={22} className="text-blue-500" />
          </div>

          {/* Navigation Tabs */}
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                    w-full flex items-center justify-end gap-3
                    px-4 py-3 rounded-xl
                    text-sm font-medium
                    transition-all duration-200
                    ${activeTab === tab.id
                    ? "bg-blue-500 text-white shadow-lg"
                    : isDarkMode
                      ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }
                  `}
              >
                <span>{tab.label}</span>
                <tab.icon size={18} />
              </button>
            ))}
          </nav>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default ManageSetting;
