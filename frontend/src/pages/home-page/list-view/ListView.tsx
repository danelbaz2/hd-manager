import React, { useCallback } from "react";
import { useViewState } from "../../../contexts";
import { type Task, type TaskStatus } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import { type SecondaryTagData } from "../../../schemas/tagTypes";
import DailyList from "./DailyList";
import WeeklyList from "./WeeklyList";
import MonthlyCalendar from "./MonthlyCalendar";
import { getWeekStart } from "../shared";
import { useTaskModal } from "../../../components/modal/modal-task";

interface ListViewProps {
  tasks: Task[];
  users: UserData[];
  tags: SecondaryTagData[];
  searchQuery?: string;
  statusFilter?: TaskStatus | null;
}

/**
 * ListView - Shows task list or calendar based on view mode
 * - Daily: Task list
 * - Weekly: Week calendar view
 * - Monthly: Month calendar view
 */
const ListView: React.FC<ListViewProps> = ({
  tasks,
  users,
  tags,
  searchQuery = "",
  statusFilter = null,
}) => {
  const { viewMode, selectedDate } = useViewState();
  const { openTaskModal } = useTaskModal();

  // Handle task click - open task modal
  const handleTaskClick = useCallback(
    (task: Task) => {
      openTaskModal(task, { enableFileHandle: false });
    },
    [openTaskModal]
  );

  // Filter tasks based on search query
  const searchFilteredTasks = React.useMemo(() => {
    if (!searchQuery.trim()) return tasks;

    const query = searchQuery.toLowerCase();

    return tasks.filter((task) => {
      // 1. Search in title and description
      if (
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      ) {
        return true;
      }

      // 2. Search in responsible users
      if (task.responsibleUserIds && task.responsibleUserIds.length > 0) {
        const rIds = task.responsibleUserIds;
        const taskUsers = users.filter((u) => rIds.includes(u.id));
        if (
          taskUsers.some(
            (u) =>
              u.fullName.toLowerCase().includes(query) ||
              u.username.toLowerCase().includes(query) ||
              (u.nickname && u.nickname.toLowerCase().includes(query))
          )
        ) {
          return true;
        }
      }

      // 3. Search in tags
      if (task.secondaryTagIds && task.secondaryTagIds.length > 0) {
        const sIds = task.secondaryTagIds;
        const taskTags = tags.filter((t) => sIds.includes(t.id));
        if (taskTags.some((t) => t.name.toLowerCase().includes(query))) {
          return true;
        }
      }

      return false;
    });
  }, [tasks, searchQuery, users, tags]);

  // Apply status filter (null = show all)
  const filteredTasks = React.useMemo(() => {
    if (statusFilter === null) return searchFilteredTasks;
    return searchFilteredTasks.filter((task) => task.status === statusFilter);
  }, [searchFilteredTasks, statusFilter]);

  // Render based on view mode
  if (viewMode === "daily") {
    return (
      <DailyList
        tasks={filteredTasks}
        users={users}
        tags={tags}
        onTaskClick={handleTaskClick}
      />
    );
  }

  if (viewMode === "weekly") {
    const weekStart = getWeekStart(new Date(selectedDate));
    return (
      <WeeklyList
        tasks={filteredTasks}
        users={users}
        weekStart={weekStart}
        onTaskClick={handleTaskClick}
      />
    );
  }

  // Monthly view
  return (
    <MonthlyCalendar
      tasks={filteredTasks}
      users={users}
      selectedDate={selectedDate}
      onTaskClick={handleTaskClick}
    />
  );
};

export default ListView;
