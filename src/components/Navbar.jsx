import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiLogIn, FiLogOut } from "react-icons/fi";
const Navbar = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

 const isAuthenticated = !!token && user;

  const handleLogout = () => {
    logout();
    navigate("/login"); 
  };

  return (
   <nav className="bg-gray-800 from-blue-600 to-indigo-700 shadow-lg p-4 sticky top-0 z-50">  
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-3xl font-extrabold text-white tracking-wide"
        >
          GemyLog
        </Link>

        <ul className="flex items-center space-x-4 md:space-x-6 text-white text-lg">  
          {isAuthenticated ? (
            <>
             
              <li>
                <Link
                  to={`/profile/${user._id}`}  
                  className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-700 transition-colors duration-200"
                  title="View Profile"
                >
                  {user.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={user.username}  
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-blue-400 shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm md:text-base border-2 border-blue-400 shadow-sm">
                      {user.username?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  <span className="hidden sm:inline text-blue-100 font-semibold text-sm md:text-md hover:text-white">
                    {user.username
                      .split(" ")
                      .map(
                        (name) =>
                          name.charAt(0).toUpperCase() +
                          name.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </span>
                </Link>
              </li>

              
              <li>
                <button
                  onClick={handleLogout}
                  className="text-white font-bold rounded-lg shadow-md transition duration-300 ease-in-out transform  bg-violet-700 hover:bg-violet-600 p-2 flex items-center"
                  title="Logout"
                >
                  <FiLogOut className="w-5 h-5" /> 
                  <span className="ml-2 hidden md:inline text-sm">Logout</span> 
                </button>
              </li>
            </>
          ) : (
            <>
              
              <li className="flex items-center space-x-2">
                <span className="hidden sm:inline text-blue-100 font-semibold text-sm md:text-md">
                  Guest
                </span>
                <Link
                  to="/login"
                  className="text-white font-bold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 bg-violet-700 hover:bg-violet-600 p-2 flex items-center"
                  title="Login"
                >
                  <FiLogIn className="w-5 h-5" />
                   <span className="ml-2 hidden md:inline text-sm">Login</span>  
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
