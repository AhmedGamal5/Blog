import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { LuEye, LuEyeOff } from "react-icons/lu";
import toast from "react-hot-toast";
import FormInput from "../components/shared/FormInput";
import {
  validateEmail,
  validatePassword,
  validateFirstName,
  validateLastName,
  validateConfirmPassword,
} from "../utils/validation";

function Signup() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setGeneralError("");
  };

  const validateForm = () => {
    const errors = {};
    const firstNameError = validateFirstName(form.firstName);
    const lastNameError = validateLastName(form.lastName);
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    const confirmPasswordError = validateConfirmPassword(
      form.password,
      form.confirmPassword
    );

    if (firstNameError) errors.firstName = firstNameError;
    if (lastNameError) errors.lastName = lastNameError;
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    if (!validateForm()) return;

    try {
      const username = `${form.firstName} ${form.lastName}`.trim();

      const res = await API.post("/auth/signup", {
        username,
        email: form.email,
        password: form.password,
      });

      const { access_token, user } = res.data;
      localStorage.setItem("token", access_token);
      API.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      login(access_token, user);

      toast.success("Account created successfully!");
      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message || "Signup failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-md bg-white shadow-xl p-7 space-y-3 rounded-lg dark:bg-gray-800"
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-800 dark:text-white">
          Create Your Account
        </h2>

        {generalError && (
          <div className="bg-red-100 border border-red-400 text-red-400 px-4 py-3 rounded">
            <span>{generalError}</span>
          </div>
        )}

        {/* First + Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            error={formErrors.firstName}
            placeholder="First Name"
          />
          <FormInput
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            error={formErrors.lastName}
            placeholder="Last Name"
          />
        </div>

        {/* Email */}
        <FormInput
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={formErrors.email}
          placeholder="Email address"
        />

        {/* Password */}
        <div className="relative">
          <FormInput
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            error={formErrors.password}
            placeholder="Enter password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            tabIndex={-1}
          >
            {showPassword ? (
              <LuEyeOff className="text-xl" />
            ) : (
              <LuEye className="text-xl" />
            )}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange}
            error={formErrors.confirmPassword}
            placeholder="Re-enter password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <LuEyeOff className="text-xl" />
            ) : (
              <LuEye className="text-xl" />
            )}
          </button>
        </div>

        <button type="submit" className="btn btn-primary w-full mt-2">
          Sign Up
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
