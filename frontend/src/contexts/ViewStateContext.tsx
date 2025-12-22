import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ViewMode = "daily" | "weekly" | "monthly";
type DisplayMode = "grid" | "list" | "tags";

interface ViewStateContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  selectedDate: number;
  setSelectedDate: (timestamp: number) => void;
}

const ViewStateContext = createContext<ViewStateContextType | undefined>(
  undefined
);

export const ViewStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("grid");
  const [selectedDate, setSelectedDate] = useState<number>(Date.now());

  return (
    <ViewStateContext.Provider
      value={{
        viewMode,
        setViewMode,
        displayMode,
        setDisplayMode,
        selectedDate,
        setSelectedDate,
      }}
    >
      {children}
    </ViewStateContext.Provider>
  );
};

export const useViewState = (): ViewStateContextType => {
  const context = useContext(ViewStateContext);
  if (!context) {
    throw new Error("useViewState must be used within a ViewStateProvider");
  }
  return context;
};

export type { ViewMode, DisplayMode };
