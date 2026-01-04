import React, { createContext, useContext, useState, useCallback } from "react";
import type { PrimaryTagData } from "../../../schemas/tagTypes";
import type { ContactData } from "../../../schemas/contactTypes";

interface TagWithInfo {
  id: string;
  name: string;
  color: string;
  description?: string | null;
  isPrimary: boolean;
  primaryId?: string;
}

interface TagsModalState {
  isOpen: boolean;
  tag: TagWithInfo | null;
  relatedContacts: ContactData[];
}

interface TagsModalContextType {
  state: TagsModalState;
  openTagsModal: (
    tag: TagWithInfo,
    contacts: ContactData[],
    primaryTags: PrimaryTagData[]
  ) => void;
  closeTagsModal: () => void;
}

const TagsModalContext = createContext<TagsModalContextType | null>(null);

export const TagsModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<TagsModalState>({
    isOpen: false,
    tag: null,
    relatedContacts: [],
  });

  const openTagsModal = useCallback(
    (
      tag: TagWithInfo,
      contacts: ContactData[],
      _primaryTags: PrimaryTagData[]
    ) => {
      // Find contacts that have this tag (or its parent primary tag)
      const tagIdToMatch = tag.isPrimary ? tag.id : tag.primaryId;
      const relatedContacts = contacts.filter((contact) =>
        contact.primaryTags.includes(tagIdToMatch || tag.id)
      );

      setState({
        isOpen: true,
        tag,
        relatedContacts,
      });
    },
    []
  );

  const closeTagsModal = useCallback(() => {
    setState({
      isOpen: false,
      tag: null,
      relatedContacts: [],
    });
  }, []);

  return (
    <TagsModalContext.Provider value={{ state, openTagsModal, closeTagsModal }}>
      {children}
    </TagsModalContext.Provider>
  );
};

export const useTagsModal = () => {
  const context = useContext(TagsModalContext);
  if (!context) {
    throw new Error("useTagsModal must be used within TagsModalProvider");
  }
  return context;
};

export type { TagWithInfo };
