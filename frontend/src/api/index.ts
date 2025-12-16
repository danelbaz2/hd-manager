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

// Tags API
export {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  type Tag,
  type TagFormPayload,
} from "./tagsApi";

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
