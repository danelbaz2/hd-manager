import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { ProtectedRoute } from "./auth";
import HomePage from "./pages/home-page/HomePage";
import TaskPage from "./pages/task-page/TaskPage";
import ChatPage from "./pages/chat-page/ChatPage";
import ArchivePage from "./pages/archive-page/ArchivePage";
import LoginPage from "./pages/login-page/LoginPage";
import SettingPage from "./pages/setting-page/SettingPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login route - standalone without Layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes - require authentication */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/tasks" element={<TaskPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/settings" element={<SettingPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
