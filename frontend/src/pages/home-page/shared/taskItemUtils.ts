// Task item utility functions

export const getStatusStyle = (status?: string) => {
  switch (status) {
    case "pending":
      return {
        label: "פתוח",
        bg: "bg-green-100",
        text: "text-green-700",
      };
    case "in_progress":
      return {
        label: "בטיפול",
        bg: "bg-amber-100",
        text: "text-amber-700",
      };
    case "completed":
      return {
        label: "הושלם",
        bg: "bg-blue-100",
        text: "text-blue-700",
      };
    case "cancelled":
      return {
        label: "בוטל",
        bg: "bg-slate-100",
        text: "text-slate-600",
      };
    default:
      return {
        label: "פתוח",
        bg: "bg-green-100",
        text: "text-green-700",
      };
  }
};

export const getGradientStyle = (colors: string[]): React.CSSProperties => {
  if (colors.length === 0) {
    return { background: "#94A3B8" }; // slate-400 default
  }
  if (colors.length === 1) {
    return { background: colors[0] };
  }
  // Create gradient from multiple colors
  const gradient = colors
    .map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`)
    .join(", ");
  return { background: `linear-gradient(to bottom, ${gradient})` };
};

export const getPriorityStyle = (priority?: string) => {
  switch (priority) {
    case "high":
      return {
        color: "bg-red-500",
        label: "גבוהה",
      };
    case "medium":
      return {
        color: "bg-amber-400",
        label: "בינונית",
      };
    case "low":
      return {
        color: "bg-green-400",
        label: "נמוכה",
      };
    default:
      return {
        color: "bg-slate-300",
        label: "רגילה",
      };
  }
};
