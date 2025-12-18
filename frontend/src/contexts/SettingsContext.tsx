import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getAllUsers, type User } from "../api/usersApi";
import { getAllTags, type Tag } from "../api/tagsApi";
import { getAllContacts, type Contact } from "../api/contactsApi";
import { getAllTasks, type Task } from "../api/tasksApi";
import { type UserData } from "../schemas/userTypes";
import { type TagData } from "../schemas/tagTypes";
import { type ContactData } from "../schemas/contactTypes";

// Helper function to convert API User to UserData
const mapUserToUserData = (user: User): UserData => ({
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    passwordHash: "",
    role: user.role as "admin" | "regular",
    color: user.color,
    profileImage: user.profileImage,
});

// Helper function to convert API Tag to TagData
const mapTagToTagData = (tag: Tag): TagData => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    description: tag.description || undefined,
});

// Helper function to convert API Contact to ContactData
const mapContactToContactData = (contact: Contact): ContactData => ({
    id: contact.id,
    name: contact.fullName,
    role: contact.position || "",
    phone: contact.phoneNumber || "",
    tags: contact.tagsIds || [],
});

// Context State Interface
interface SettingsContextState {
    // Data
    users: UserData[];
    tags: TagData[];
    contacts: ContactData[];
    tasks: Task[];

    // Loading states
    isLoading: boolean;
    isLoadingUsers: boolean;
    isLoadingTags: boolean;
    isLoadingContacts: boolean;
    isLoadingTasks: boolean;

    // Refresh functions
    refreshUsers: () => Promise<void>;
    refreshTags: () => Promise<void>;
    refreshContacts: () => Promise<void>;
    refreshTasks: () => Promise<void>;
    refreshAll: () => Promise<void>;
}

// Default context value
const defaultContextValue: SettingsContextState = {
    users: [],
    tags: [],
    contacts: [],
    tasks: [],
    isLoading: true,
    isLoadingUsers: false,
    isLoadingTags: false,
    isLoadingContacts: false,
    isLoadingTasks: false,
    refreshUsers: async () => { },
    refreshTags: async () => { },
    refreshContacts: async () => { },
    refreshTasks: async () => { },
    refreshAll: async () => { },
};

// Create Context
const SettingsContext = createContext<SettingsContextState>(defaultContextValue);

// Provider Props
interface SettingsProviderProps {
    children: ReactNode;
}

// Provider Component
export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [tags, setTags] = useState<TagData[]>([]);
    const [contacts, setContacts] = useState<ContactData[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isLoadingTags, setIsLoadingTags] = useState(false);
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);

    // Fetch users
    const refreshUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        try {
            const response = await getAllUsers();
            if (response.success && response.data) {
                setUsers(response.data.map(mapUserToUserData));
            } else {
                console.error("Failed to fetch users:", response.error);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoadingUsers(false);
        }
    }, []);

    // Fetch tags
    const refreshTags = useCallback(async () => {
        setIsLoadingTags(true);
        try {
            const response = await getAllTags();
            if (response.success && response.data) {
                setTags(response.data.map(mapTagToTagData));
            } else {
                console.error("Failed to fetch tags:", response.error);
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
        } finally {
            setIsLoadingTags(false);
        }
    }, []);

    // Fetch contacts
    const refreshContacts = useCallback(async () => {
        setIsLoadingContacts(true);
        try {
            const response = await getAllContacts();
            if (response.success && response.data) {
                setContacts(response.data.map(mapContactToContactData));
            } else {
                console.error("Failed to fetch contacts:", response.error);
            }
        } catch (error) {
            console.error("Error fetching contacts:", error);
        } finally {
            setIsLoadingContacts(false);
        }
    }, []);

    // Fetch tasks - gets all tasks without date filtering
    const refreshTasks = useCallback(async () => {
        setIsLoadingTasks(true);
        try {
            const response = await getAllTasks();
            if (response.success && response.data) {
                setTasks(response.data);
            } else {
                console.error("Failed to fetch tasks:", response.error);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setIsLoadingTasks(false);
        }
    }, []);

    // Fetch all data
    const refreshAll = useCallback(async () => {
        setIsLoading(true);
        await Promise.all([
            refreshUsers(),
            refreshTags(),
            refreshContacts(),
            refreshTasks(),
        ]);
        setIsLoading(false);
    }, [refreshUsers, refreshTags, refreshContacts, refreshTasks]);

    // Initial fetch on mount
    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    const value: SettingsContextState = {
        users,
        tags,
        contacts,
        tasks,
        isLoading,
        isLoadingUsers,
        isLoadingTags,
        isLoadingContacts,
        isLoadingTasks,
        refreshUsers,
        refreshTags,
        refreshContacts,
        refreshTasks,
        refreshAll,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

// Custom Hook to use Settings Context
export const useSettings = (): SettingsContextState => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
};

export default SettingsContext;
