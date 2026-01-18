import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import App from "./App.tsx";
import { queryClient } from "./api/queryClient";
import {
  ThemeProvider,
  SettingsProvider,
  ViewStateProvider,
  AuthProvider,
  SocketProvider,
} from "./contexts";
import { RealtimeSyncProvider } from "./lib/socket";
import { TaskModalProvider, TaskModal } from "./components/modal/modal-task";
import { TagsModalProvider, TagsModal } from "./components/modal/modal-tags";
import {
  CloseTaskModalProvider,
  CloseTaskModal,
} from "./components/modal/modal-close-task";
import { TourProvider } from "./components/onboarding/tour-provider";
import { TourOverlay } from "./components/onboarding/tour-overlay";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <SocketProvider>
            {/* RealtimeSyncProvider bridges WebSocket events to React Query cache */}
            <RealtimeSyncProvider>
              <SettingsProvider>
                <ViewStateProvider>
                  <TagsModalProvider>
                    <TaskModalProvider>
                      <CloseTaskModalProvider>
                        <TourProvider>
                          <App />
                          <TaskModal />
                          <TagsModal />
                          <CloseTaskModal />
                          {/* Guided Tour Overlay */}
                          <TourOverlay />
                        </TourProvider>
                      </CloseTaskModalProvider>
                    </TaskModalProvider>
                  </TagsModalProvider>
                </ViewStateProvider>
              </SettingsProvider>
            </RealtimeSyncProvider>
          </SocketProvider>
        </ThemeProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
