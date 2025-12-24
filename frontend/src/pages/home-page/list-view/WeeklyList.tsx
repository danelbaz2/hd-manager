import React from "react";
import { useTheme } from "../../../contexts";
import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import DayCell from "./DayCell";

interface WeeklyListProps {
  tasks: Task[];
  users: UserData[];
  weekStart: Date;
  onTaskClick?: (task: Task) => void;
}

const getDaysOfWeek = (weekStart: Date): Date[] => {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
};

const getTasksForDate = (tasks: Task[], date: Date): Task[] => {
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(date);
  dateEnd.setHours(23, 59, 59, 999);

  return tasks.filter((task) => {
    if (!task.date) return false;
    const taskDate = new Date(task.date);
    return taskDate >= dateStart && taskDate <= dateEnd;
  });
};

const isDateToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const WeeklyList: React.FC<WeeklyListProps> = ({
  tasks,
  users,
  weekStart,
  onTaskClick,
}) => {
  const { isDarkMode } = useTheme();
  const days = getDaysOfWeek(weekStart);

  const handleDayClick = (_date: Date) => {
    // Could navigate to daily view for this date in the future
  };

  return (
    <div
      className={`rounded-2xl border p-4 h-full overflow-auto ${
        isDarkMode
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200"
      }`}
      dir="rtl"
    >
      <div className="grid grid-cols-7 gap-2 h-full">
        {days.map((day) => {
          const dayTasks = getTasksForDate(tasks, day);
          return (
            <DayCell
              key={day.toISOString()}
              date={day}
              tasks={dayTasks}
              users={users}
              isToday={isDateToday(day)}
              onDayClick={handleDayClick}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyList;
