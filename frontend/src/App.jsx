import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Mainlayout";
import Dashboard from "./pages/Dashboard";
import Document from "./pages/Document";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import VerifyEmail from "./pages/auth/VerifyLogin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ProtectedRoute from "./routes/ProtectectedRoute";
import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./pages/adminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="documents" element={<Document />} />
            <Route path="upload" element={<Upload />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
