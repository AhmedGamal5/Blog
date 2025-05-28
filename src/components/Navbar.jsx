import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiLogIn } from "react-icons/fi";
import { FiLogOut } from "react-icons/fi";
const Navbar = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const isAuthenticated = !!token;

  const handleLogout = () => {
    logout();
    navigate("/login"); 
  };

  return (
    <nav className="bg-gray-800 from-blue-600 to-indigo-700 shadow-lg p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-3xl font-extrabold text-white tracking-wide"
        >
          My Blog
        </Link>

        <ul className="flex items-center space-x-6 text-white text-lg">
          {isAuthenticated ? (
            <>
              <li className="flex items-center space-x-2">
                <span className="text-blue-100 font-semibold text-md">
                  {user.username
                    .split(" ")
                    .map(
                      (name) =>
                        name.charAt(0).toUpperCase() +
                        name.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-white font-bold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 bg-violet-700 hover:bg-violet-600 p-2"
                >
                  <FiLogOut />
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-center space-x-2">
                <span className="text-blue-100 font-semibold text-md">
                  Guest
                </span>
                <Link
                  to="/login"
                  className="text-white font-bold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 bg-violet-700 hover:bg-violet-600 p-2"
                >
                  <FiLogIn />
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
