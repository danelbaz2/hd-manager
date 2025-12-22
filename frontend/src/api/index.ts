// API Index - Central export point for all API modules

// API Configuration
export { API_BASE_URL, API_ENDPOINTS, apiRequest, type ApiResponse } from "./apiConfig";

// Users API
export {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  type User,
} from "./usersApi";

// Tasks API
export {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  type Task,
  type TaskFormData,
  type TaskQueryParams,
} from "./tasksApi";

// Primary Tags API (Two-tier tag system)
export {
  getAllPrimaryTags,
  getPrimaryTag,
  createPrimaryTag,
  updatePrimaryTag,
  deletePrimaryTag,
  type PrimaryTag,
  type PrimaryTagFormPayload,
} from "./primaryTagsApi";

// Secondary Tags API (New two-tier tag system)
export {
  getAllSecondaryTags,
  getSecondaryTagsByPrimary,
  getSecondaryTag,
  createSecondaryTag,
  updateSecondaryTag,
  deleteSecondaryTag,
  type SecondaryTag,
  type SecondaryTagFormPayload,
  type SecondaryTagQueryParams,
} from "./secondaryTagsApi";

// Contacts API
export {
  getAllContacts,
  createContact,
  updateContact,
  deleteContact,
  type Contact,
  type ContactFormPayload,
} from "./contactsApi";

// History API
export {
  getHistoryEntries,
  createHistoryEntry,
  type HistoryEntry,
  type HistoryEntryFormData,
  type HistoryQueryParams,
} from "./historyApi";

// Chat API
export {
  getAllChatMessages,
  createChatMessage,
  type ChatMessage,
  type ChatMessageFormData,
} from "./chatApi";

// Auth API
export {
  loginUser,
  getCurrentUser,
  type AuthUser,
  type LoginRequest,
  type LoginResponse,
  type MeResponse,
} from "./authApi";
