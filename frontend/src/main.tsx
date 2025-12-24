import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
  ThemeProvider,
  SettingsProvider,
  ViewStateProvider,
  AuthProvider,
} from "./contexts";
import { TaskModalProvider, TaskModal } from "./components/modal/modal-task";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <SettingsProvider>
          <ViewStateProvider>
            <TaskModalProvider>
              <App />
              <TaskModal />
            </TaskModalProvider>
          </ViewStateProvider>
        </SettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);
