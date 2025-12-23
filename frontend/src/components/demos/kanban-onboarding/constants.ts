import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export const STORAGE_KEY = "kanban_onboarding_completed";
export const ANIMATION_CYCLE_DURATION = 3000; // Total cycle duration in ms

// Demo columns configuration (matches real columns)
export const DEMO_COLUMNS = [
    { id: "pending", title: "פתוח", icon: AlertCircle, colorClass: "text-emerald-500" },
    { id: "in_progress", title: "בטיפול", icon: Clock, colorClass: "text-amber-500" },
    { id: "completed", title: "סגור", icon: CheckCircle2, colorClass: "text-slate-400" },
];
