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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <SettingsProvider>
          <ViewStateProvider>
            <App />
          </ViewStateProvider>
        </SettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);
