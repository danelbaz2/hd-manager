import React from "react";
import { useViewState } from "../../../contexts";
import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import { type SecondaryTagData } from "../../../schemas/tagTypes";
import DailyList from "./DailyList";
import { TaskListWeekly } from "../parts";
import MonthlyCalendar from "./MonthlyCalendar";
import { getWeekStart } from "../shared";

interface ListViewProps {
  tasks: Task[];
  users: UserData[];
  tags: SecondaryTagData[];
}

/**
 * ListView - Shows task list or calendar based on view mode
 * - Daily: Task list
 * - Weekly: Original calendar week view (from parts)
 * - Monthly: Month calendar view
 */
const ListView: React.FC<ListViewProps> = ({ tasks, users, tags }) => {
  const { viewMode, selectedDate } = useViewState();

  // Handle task click
  const handleTaskClick = (task: Task) => {
    console.log("Task clicked:", task);
    // TODO: Open task detail modal
  };

  // Render based on view mode
  if (viewMode === "daily") {
    return <DailyList tasks={tasks} users={users} tags={tags} />;
  }

  if (viewMode === "weekly") {
    const weekStart = getWeekStart(new Date(selectedDate));
    return (
      <TaskListWeekly
        tasks={tasks}
        users={users}
        weekStart={weekStart}
        onTaskClick={handleTaskClick}
      />
    );
  }

  // Monthly view
  return (
    <MonthlyCalendar
      tasks={tasks}
      users={users}
      selectedDate={selectedDate}
      onTaskClick={handleTaskClick}
    />
  );
};

export default ListView;
