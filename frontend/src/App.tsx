import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/homepage/HomePage";
import TaskPage from "./pages/taskpage/TaskPage";
import ChatPage from "./pages/chatpage/ChatPage";
import LoginPage from "./pages/loginpage/LoginPage";
import SettingPage from "./pages/settingpage/SettingPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login route - standalone without Layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* All other routes wrapped in Layout (with MenuBar and LineBar) */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/tasks" element={<TaskPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/settings" element={<SettingPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
