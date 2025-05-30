import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PostsList from "./pages/PostsList";
import { Toaster } from "react-hot-toast";
import LayoutWithNavbar from "./components/LayoutWithNavbar";
import PostDetailPage from "./pages/PostDetailPage";

import "./App.css";

function App() {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<LayoutWithNavbar />}>
          <Route path="/" element={<PostsList />} />
          <Route path="/posts" element={<PostsList />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
