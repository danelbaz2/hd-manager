import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
  ThemeProvider,
  SettingsProvider,
  ViewStateProvider,
  AuthProvider,
  SocketProvider,
} from "./contexts";
import { TaskModalProvider, TaskModal } from "./components/modal/modal-task";
import { TagsModalProvider, TagsModal } from "./components/modal/modal-tags";
import { TourProvider } from "./components/demos/tour-provider";
import { TourOverlay } from "./components/demos/tour-overlay";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <SocketProvider>
          <SettingsProvider>
            <ViewStateProvider>
              <TagsModalProvider>
                <TaskModalProvider>
                  <TourProvider>
                    <App />
                    <TaskModal />
                    <TagsModal />
                    {/* Guided Tour Overlay */}
                    <TourOverlay />
                  </TourProvider>
                </TaskModalProvider>
              </TagsModalProvider>
            </ViewStateProvider>
          </SettingsProvider>
        </SocketProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);
