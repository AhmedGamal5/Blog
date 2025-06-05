import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getCurrentUserProfile,
  updateUserProfile,
  uploadProfilePicture,
} from "../services/userService";
import toast from "react-hot-toast";

const EditProfilePage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

 const [currentProfilePictureUrl, setCurrentProfilePictureUrl] = useState(user?.profilePictureUrl || null);  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      try {
        const response = await getCurrentUserProfile();
        setFormData({
          username: response.data.username || "",
          email: response.data.email || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile for editing:", error);
        toast.error(
          "Could not load your profile data. Please try again later."
        );
        navigate(`/profile/${user?._id || ""}`);
      } finally {
        setInitialLoading(false);
      }
    };

    if (user) {
      fetchCurrentProfile();
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const dataToUpdate = {};
    if (formData.username && formData.username !== user.username) {
      dataToUpdate.username = formData.username;
    }
    if (formData.email && formData.email !== user.email) {
      dataToUpdate.email = formData.email;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      toast.success("No changes to save.");
      setIsSubmitting(false);
      navigate(`/profile/${user._id}`);
      return;
    }

    try {
      const response = await updateUserProfile(dataToUpdate);
      toast.success("Profile updated successfully!");

      const updatedUserFromServer = response.data;
      if (login && user) {
        login(localStorage.getItem("token"), updatedUserFromServer);
      }

      navigate(`/profile/${user._id}`);
    } catch (err) {
      console.error("Profile update error:", err);
      if (err.response && err.response.data && err.response.status === 400) {
        const backendErrors = err.response.data.message;
        if (Array.isArray(backendErrors)) {
          const newErrors = {};
          backendErrors.forEach((errMsg) => {
            if (errMsg.toLowerCase().includes("username"))
              newErrors.username = errMsg;
            else if (errMsg.toLowerCase().includes("email"))
              newErrors.email = errMsg;
            else toast.error(errMsg);
          });
          setErrors(newErrors);
        } else if (typeof backendErrors === "object") {
          setErrors(backendErrors);
        } else {
          toast.error(
            backendErrors ||
              "Failed to update profile. Please check your input."
          );
        }
      } else {
        toast.error(
          err.response?.data?.message || "An unexpected error occurred."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 3 * 1024 * 1024) {
        toast.error("File is too large. Max 3MB allowed.");
        return;
      }
      if (
        ![
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "image/jpg",
        ].includes(file.type)
      ) {
        toast.error("Invalid file type. Only JPG, PNG, GIF, WEBP allowed.");
        return;
      }
      setSelectedFile(file);
    }
  };

const handlePictureUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image file first.");
      return;
    }
    setIsUploadingPicture(true);
    // console.log("PICTURE_UPLOAD: Starting upload for file:", selectedFile.name); 

    const uploadFormData = new FormData();
    uploadFormData.append("profilePicture", selectedFile);  

    try {
      console.log("PICTURE_UPLOAD: Calling uploadProfilePicture service...");  
      const response = await uploadProfilePicture(uploadFormData); 
    //   console.log("PICTURE_UPLOAD: API response received:", response);  

      const updatedUserFromServer = response.data; 

    //   console.log("PICTURE_UPLOAD: User data from server after upload:", updatedUserFromServer);  

      toast.success("Profile picture updated!");
      setCurrentProfilePictureUrl(updatedUserFromServer.profilePictureUrl);  
      setSelectedFile(null); 
      setPreviewUrl(null);

      if (login && user) {
        // console.log("PICTURE_UPLOAD: Updating AuthContext with user:", updatedUserFromServer);  
        login(localStorage.getItem("token"), updatedUserFromServer); 
      }
    } catch (err) {
      console.error("PICTURE_UPLOAD: Profile picture upload error:", err); 
      if (err.response) {
        console.error("PICTURE_UPLOAD: Error response data:", err.response.data);  
        console.error("PICTURE_UPLOAD: Error response status:", err.response.status); 
      }
      toast.error(err.response?.data?.message || "Failed to upload picture.");
    } finally {
      setIsUploadingPicture(false);
      console.log("PICTURE_UPLOAD: Upload attempt finished."); 
    }
  };

  if (initialLoading) {
    return (
      <div className="text-center py-10 dark:text-gray-300">
        Loading your profile for editing...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 flex justify-center">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Edit Your Profile
          </h1>

          {/* Profile Picture Section */}
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              <img
                src={
                  previewUrl ||
                  currentProfilePictureUrl ||
                  "https://via.placeholder.com/150?text=No+Image"
                } // Fallback placeholder
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mx-auto border-2 border-gray-300 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-md"
                title="Change profile picture"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path
                    fillRule="evenodd"
                    d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg, image/png, image/gif, image/webp"
              className="hidden"
              id="profilePictureInput"
            />
            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selected: {selectedFile.name}
                </p>
                <button
                  type="button"
                  onClick={handlePictureUpload}
                  disabled={isUploadingPicture}
                  className="mt-2 px-4 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-sm disabled:opacity-60"
                >
                  {isUploadingPicture ? "Uploading..." : "Click here to upload"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}  
                  disabled={isUploadingPicture}
                  className="ml-2 mt-2 px-4 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md shadow-sm disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          {/* End Profile Picture Section */}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md focus:ring-2 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 ${
                  errors.username
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">{errors.username}</p>
              )}
            </div>
            <div className="mb-8">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md focus:ring-2 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/profile/${user?._id}`)}
                className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md transition-colors"
              >
                Cancel Changes
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
