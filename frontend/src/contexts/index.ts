/**
 * Contexts barrel export
 * Import from here for cleaner imports
 */

// Auth
export { AuthProvider, useAuth } from "./AuthContext";

// Theme
export { ThemeProvider, useTheme } from "./ThemeContext";

// View State
export { ViewStateProvider, useViewState } from "./ViewStateContext";

// Settings (modular)
export { SettingsProvider, useSettings } from "./SettingsContext";

// Individual context hooks (recommended for performance)
export { useUsers } from "./UsersContext";
export { useTags } from "./TagsContext";
export { useContacts } from "./ContactsContext";
export { useTasks } from "./TasksContext";
export { useHistory } from "./HistoryContext";
export { ChatProvider } from "./ChatContext";

// Socket (re-export from socket module for convenience)
export { SocketProvider, useSocket } from "../lib/socket";
export { useChatSync, useChatUpdates } from "../lib/socket";
export { useTaskUpdates, useUserUpdates } from "../lib/socket";
