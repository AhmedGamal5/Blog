import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { LuEye, LuEyeOff } from "react-icons/lu";
import toast from "react-hot-toast";
import FormInput from "../components/shared/FormInput";
import { validateEmail, validatePassword } from "../utils/validation";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);

    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const loginRes = await API.post("/auth/login", {
        email: form.email,
        password: form.password,
      });
      console.log("Login response>>>>>>>>>>>", loginRes.data);
      const { access_token } = loginRes.data;
      API.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      
      const userRes = await API.get("/users/profile");
      const user = userRes.data;
      console.log("User response>>>>>>>>>>>", user);
      
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      login(access_token, user);

      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
      console.error("Login error:", err);

       localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete API.defaults.headers.common["Authorization"];
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-md bg-white shadow-xl p-8 space-y-4 rounded-lg dark:bg-gray-800"
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-800 dark:text-white">
          Welcome Back
        </h2>

        <FormInput
          id="email"
          name="email"
          label="Email Address *"
          type="text"
          value={form.email}
          onChange={handleChange}
          error={formErrors.email}
          placeholder="Email address"
        />

        <FormInput
          id="password"
          name="password"
          label="Password *"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={handleChange}
          error={formErrors.password}
          placeholder="Enter your password"
          icon={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-gray-500 dark:text-gray-400"
              tabIndex={-1}
            >
              {showPassword ? (
                <LuEyeOff className="text-xl mt-2" />
              ) : (
                <LuEye className="text-xl mt-2" />
              )}
            </button>
          }
        />

        <button type="submit" className="btn btn-primary w-full mt-4">
          Login
        </button>

        <p className="text-sm text-center text-gray-600 dark:text-gray-300">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
