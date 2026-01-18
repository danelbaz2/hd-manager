/**
 * Users Feature - Domain module for user management
 */

// Context
export { UsersProvider, useUsers } from './context/users.context';

// Types
export type { UserRole, UserData, UserFormData } from './types/user.types';
export { AVAILABLE_COLORS, DEFAULT_FORM_DATA } from './types/user.types';

// API
export {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from './api/users.api';

export type { User } from './api/users.api';

// Queries
export {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  invalidateUserQueries,
} from './api/users.queries';
