import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface CloseTaskModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const CloseTaskModalContext = createContext<CloseTaskModalContextType | null>(
  null
);

interface CloseTaskModalProviderProps {
  children: ReactNode;
}

/**
 * CloseTaskModalProvider - Context provider for managing close task modal state
 */
export const CloseTaskModalProvider: React.FC<CloseTaskModalProviderProps> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <CloseTaskModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </CloseTaskModalContext.Provider>
  );
};

/**
 * useCloseTaskModal - Hook to access close task modal context
 */
export const useCloseTaskModal = (): CloseTaskModalContextType => {
  const context = useContext(CloseTaskModalContext);
  if (!context) {
    throw new Error(
      "useCloseTaskModal must be used within CloseTaskModalProvider"
    );
  }
  return context;
};
