import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider, SettingsProvider, ViewStateProvider } from "./contexts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <SettingsProvider>
        <ViewStateProvider>
          <App />
        </ViewStateProvider>
      </SettingsProvider>
    </ThemeProvider>
  </StrictMode>
);
