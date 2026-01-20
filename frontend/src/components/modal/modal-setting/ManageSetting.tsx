import React, { useState, useMemo } from "react";
import {
  X,
  Settings,
  Users,
  UserPlus,
  Tag,
  UserCog,
  Building2,
} from "lucide-react";
import { useTheme, useAuth } from "../../../contexts";
import { ModalOverlay } from "../../common/ModalOverlay";
import ManageUser from "./manage-user/ManageUser.tsx";
import ManageContact from "./manage-contact/ManageContact.tsx";
import ManageTagsTwoTier from "./manage-tags";
import { ProfileSettings } from "./profile-settings";
import { ManageMilitaryHierarchy } from "./manage-military-hierarchy";

interface ManageSettingProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "users" | "contacts" | "tags" | "profile" | "hierarchy";

// All available tabs configuration
const ALL_TABS = [
  { id: "users" as TabType, label: "עובדים", icon: Users, adminOnly: true },
  {
    id: "contacts" as TabType,
    label: "אנשי קשר",
    icon: UserPlus,
    adminOnly: false,
  },
  { id: "tags" as TabType, label: "תגיות", icon: Tag, adminOnly: true },
  {
    id: "hierarchy" as TabType,
    label: "עץ ציוות",
    icon: Building2,
    adminOnly: true,
  },
  {
    id: "profile" as TabType,
    label: "פרופיל",
    icon: UserCog,
    adminOnly: false,
  },
];

const ManageSetting: React.FC<ManageSettingProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Filter tabs based on user role
  const tabs = useMemo(() => {
    return ALL_TABS.filter((tab) => isAdmin || !tab.adminOnly);
  }, [isAdmin]);

  // Default to first available tab
  const defaultTab = tabs[0]?.id || "contacts";
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  // Render all admin tabs if admin, otherwise only non-admin tabs
  // Components stay mounted to preserve state
  const adminTabs = isAdmin ? (
    <>
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ display: activeTab === "users" ? "flex" : "none" }}
      >
        <ManageUser />
      </div>
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ display: activeTab === "tags" ? "flex" : "none" }}
      >
        <ManageTagsTwoTier />
      </div>
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ display: activeTab === "hierarchy" ? "flex" : "none" }}
      >
        <ManageMilitaryHierarchy />
      </div>
    </>
  ) : null;

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
              ${
                isDarkMode
                  ? "hover:bg-slate-700 text-slate-400"
                  : "hover:bg-slate-100 text-slate-500"
              }
            `}
        >
          <X size={24} />
        </button>

        {/* Main Content Area - All tabs rendered but hidden/shown */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Admin-only tabs */}
          {adminTabs}

          {/* Non-admin tabs (always rendered) */}
          <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{ display: activeTab === "contacts" ? "flex" : "none" }}
          >
            <ManageContact />
          </div>
          <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{ display: activeTab === "profile" ? "flex" : "none" }}
          >
            <ProfileSettings />
          </div>
        </div>

        {/* Right Sidebar */}
        <div
          className={`
              w-56 shrink-0
              border-l
              p-6
              flex flex-col
              ${
                isDarkMode
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
                    ${
                      activeTab === tab.id
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
