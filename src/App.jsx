import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PostsList from "./pages/PostsList";
import { Toaster } from "react-hot-toast";
import LayoutWithNavbar from "./components/LayoutWithNavbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PostDetailPage from "./pages/PostDetailPage";
import UserProfilePage from "./pages/UserProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import { AuthProvider } from "./context/AuthContext";

import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<LayoutWithNavbar />}>
            <Route path="/" element={<PostsList />} />
            <Route path="/posts" element={<PostsList />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />} />
            <Route
              path="/profile/edit" element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
