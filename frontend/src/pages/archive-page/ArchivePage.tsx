import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import HeaderArchivePage from "./HeaderArchivePage";
import ListTaskArchive from "./ListTaskArchive";
import {
  type ArchiveFilters,
  defaultFilters,
} from "../../schemas/archiveTypes";
import { getAllTasks, type Task } from "../../api/tasksApi";
import { getAllUsers } from "../../api/usersApi";
import { getAllSecondaryTags } from "../../api/secondaryTagsApi";
import { type UserData } from "../../schemas/userTypes";
import { type SecondaryTagData } from "../../schemas/tagTypes";
import { Loader2 } from "lucide-react";

const ArchivePage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [filters, setFilters] = useState<ArchiveFilters>(defaultFilters);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [tags, setTags] = useState<SecondaryTagData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [tasksRes, usersRes, tagsRes] = await Promise.all([
          getAllTasks(),
          getAllUsers(),
          getAllSecondaryTags(),
        ]);
        if (tasksRes.success && tasksRes.data) setTasks(tasksRes.data);
        if (usersRes.success && usersRes.data)
          setUsers(usersRes.data as UserData[]);
        if (tagsRes.success && tagsRes.data)
          setTags(tagsRes.data as SecondaryTagData[]);
      } catch (error) {
        console.error("Error fetching archive data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center
        ${isDarkMode ? "bg-slate-900" : "bg-slate-50"}`}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className={`w-10 h-10 animate-spin
            ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
          />
          <span className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
            טוען נתונים...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col
      ${isDarkMode ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-800"}`}
    >
      <div className="relative z-10">
        <HeaderArchivePage filters={filters} onFiltersChange={setFilters} />
      </div>

      <div className="flex-1 p-4 w-full overflow-auto">
        <ListTaskArchive
          tasks={tasks}
          users={users}
          tags={tags}
          filters={filters}
        />
      </div>
    </div>
  );
};

export default ArchivePage;
