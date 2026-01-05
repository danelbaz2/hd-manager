/**
 * TagsContext - Manages primary and secondary tags state
 * Split from SettingsContext for better performance
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { getAllPrimaryTags, type PrimaryTag } from "../api/primaryTagsApi";
import { getAllSecondaryTags } from "../api/secondaryTagsApi";
import {
  type PrimaryTagData,
  type SecondaryTagData,
  getLighterColor,
  TAG_COLORS,
} from "../schemas/tagTypes";
import { useAuth } from "./AuthContext";

// Helper function to convert API PrimaryTag to PrimaryTagData
const mapPrimaryTagToData = (tag: PrimaryTag): PrimaryTagData => ({
  id: tag.id,
  name: tag.name,
  color: tag.color,
  description: tag.description || undefined,
});

interface TagsContextState {
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  isLoadingTags: boolean;
  refreshTags: (silent?: boolean) => Promise<void>;
}

const defaultValue: TagsContextState = {
  primaryTags: [],
  secondaryTags: [],
  isLoadingTags: false,
  refreshTags: async () => {},
};

const TagsContext = createContext<TagsContextState>(defaultValue);

interface TagsProviderProps {
  children: ReactNode;
}

export const TagsProvider: React.FC<TagsProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [primaryTags, setPrimaryTags] = useState<PrimaryTagData[]>([]);
  const [secondaryTags, setSecondaryTags] = useState<SecondaryTagData[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  const refreshTags = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingTags(true);
    try {
      const [primaryResponse, secondaryResponse] = await Promise.all([
        getAllPrimaryTags(),
        getAllSecondaryTags(),
      ]);

      if (primaryResponse.success && primaryResponse.data) {
        setPrimaryTags(primaryResponse.data.map(mapPrimaryTagToData));
      } else {
        console.error("Failed to fetch primary tags:", primaryResponse.error);
      }

      if (
        secondaryResponse.success &&
        secondaryResponse.data &&
        primaryResponse.data
      ) {
        // Map secondary tags with computed colors from parent primary tag
        const primaryTagsMap = new Map(
          primaryResponse.data.map((pt) => [pt.id, pt])
        );
        const mappedSecondaryTags = secondaryResponse.data.map(
          (tag): SecondaryTagData => {
            const parentTag = primaryTagsMap.get(tag.primaryTagId);
            return {
              id: tag.id,
              name: tag.name,
              primaryTagId: tag.primaryTagId,
              color: parentTag
                ? getLighterColor(parentTag.color)
                : TAG_COLORS[0].bg,
              description: tag.description || undefined,
            };
          }
        );
        setSecondaryTags(mappedSecondaryTags);
      } else if (secondaryResponse.error) {
        console.error(
          "Failed to fetch secondary tags:",
          secondaryResponse.error
        );
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      if (!silent) setIsLoadingTags(false);
    }
  }, []);

  // Initial fetch when authenticated
  useEffect(() => {
    if (isAuthLoading) return;
    if (isAuthenticated) {
      refreshTags();
    } else {
      const hasStoredToken = sessionStorage.getItem("auth_token");
      if (!hasStoredToken) {
        setPrimaryTags([]);
        setSecondaryTags([]);
      }
    }
  }, [isAuthenticated, isAuthLoading, refreshTags]);

  const value: TagsContextState = {
    primaryTags,
    secondaryTags,
    isLoadingTags,
    refreshTags,
  };

  return <TagsContext.Provider value={value}>{children}</TagsContext.Provider>;
};

export const useTags = (): TagsContextState => {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error("useTags must be used within a TagsProvider");
  }
  return context;
};

export default TagsContext;
