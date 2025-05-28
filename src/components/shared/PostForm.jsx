import { useState } from "react";
import toast from "react-hot-toast";

const PostForm = ({
  initialData = {},
  onCancel,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    content: initialData.content || "",
    image: initialData.imageUrl || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData.imageUrl || "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dataToSubmit = new FormData();
      dataToSubmit.append("title", formData.title);
      dataToSubmit.append("content", formData.content);
      
      if (imageFile) {
        dataToSubmit.append("image", imageFile);
      } else if (formData.image) {
        dataToSubmit.append("imageUrl", formData.image);
      }

      await onSubmit(dataToSubmit);
      
      if (imageFile && imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    } catch (error) {
      toast.error("Failed to submit form");
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter post title"
          required
          disabled={isLoading}
        />
      </div>

      {/* Image Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {imageFile ? "New Image Selected" : "Image"}
        </label>
        <input
          type="file"
          name="image"
          onChange={handleFileChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          accept="image/*"
          disabled={isLoading}
        />
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-32 object-cover rounded-lg"
            />
          </div>
        )}
        {!imagePreview && formData.image && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Current image will be kept</p>
          </div>
        )}
      </div>

      {/* Content Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Write your description here..."
          rows="4"
          required
          disabled={isLoading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Submit"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default PostForm;