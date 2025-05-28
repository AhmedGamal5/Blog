import { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import ConfirmModal from "../components/shared/ConfirmModal";
import PostForm from "../components/shared/PostForm";
import PostModal from "../components/shared/PostModal";
import PostCardSkeleton from "../components/PostCardSkeleton";
import ExpandableText from "../components/ExpandableText";
import PaginationControls from "../components/PaginationControls";
const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    postId: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isSubmittingNewPost, setIsSubmittingNewPost] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(9);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/posts", {
        params: {
          page: currentPage,
          limit: postsPerPage,
          search: searchTerm,
        },
      });

      const { data, total } = res.data;

      const postsWithNewIds = data.map((post) => ({
        ...post,
        id: post._id,
      }));

      setPosts(postsWithNewIds);
      setTotalPosts(total);
      setTotalPages(Math.ceil(total / postsPerPage));
    } catch (err) {
      toast.error("Failed to fetch posts.");
      console.error("Fetch posts error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, postsPerPage, searchTerm]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const handleDelete = async (post) => {
    let isAuthor = false;
    //  console.log("postId>>>>", post.author._id);
    //     console.log("userId>>>>", user._id);
    if (user) {
      isAuthor = user._id === post.author._id;
    }
    if (isAuthor) {
      setConfirmModal({
        isOpen: true,
        postId: post.id,
      });
    } else {
      toast.error("You can only delete your own posts.");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await API.delete(`/posts/${confirmModal.postId}`);
      setPosts(posts.filter((post) => post.id !== confirmModal.postId));
      setCurrentPage(1);
      await fetchPosts();
      toast.success("Post deleted successfully");
    } catch (err) {
      toast.error("Failed to delete post");
      console.error("Delete post error:", err);
    } finally {
      setConfirmModal({ isOpen: false, postId: null });
    }
  };

  const handleEditClick = (post) => {
    let isAuthor = false;
    if (user) {
      isAuthor = user._id === post.author._id;
    }
    // console.log("uesrName>>>>", post.author.username);
    // console.log("user>>>>", user.username);
    // user?._id === undefined? isAuthor = false : isAuthor;
    // console.log("isAuthor>>>>", isAuthor);
    // console.log("post.author.id>>>>", post.author._id);
    // console.log("user.id>>>>", user._id);
    if (isAuthor) {
      setEditingPostId(post.id);
    } else {
      toast.error("You can only edit your own posts.");
    }
  };

  const handleEditSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await API.put(`/posts/${editingPostId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedPost = { ...res.data, id: res.data._id };
      setPosts(posts.map((p) => (p.id === editingPostId ? updatedPost : p)));
      // console.log("Updated post>>>>", updatedPost);
      await fetchPosts();
      toast.success("Post updated successfully");
      setEditingPostId(null);
    } catch (err) {
      toast.error("Failed to update post");
      console.error("Edit post error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
  };

  //** --- New Post Handling ---**//
  const openNewPostModal = () => {
    setIsNewPostModalOpen(true);
  };

  const closeNewPostModal = () => {
    setIsNewPostModalOpen(false);
  };

  const handleSubmitNewPost = async (formData) => {
    setIsSubmittingNewPost(true);
    try {
      const res = await API.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newPost = { ...res.data, id: res.data._id };
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      closeNewPostModal();
      setCurrentPage(1);
      await fetchPosts();
      toast.success("Post created successfully!");
    } catch (error) {
      toast.error("Failed to create post.");
      console.error("Create post error:", error);
    } finally {
      setIsSubmittingNewPost(false);
    }
  };
  //** --- End New Post Handling --- **//

  return (
    <div className="min-h-screen dark:bg-gray-900 py-8 relative">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            My Blog Posts
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search posts, authors, or content..."
              value={searchTerm}
              // onChange={(e) => setSearchTerm(e.target.value)}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Posts Count */}
        <div className="mb-6 text-center">
          <p className="text-gray-300">
            {loading ? (
              <span className="animate-pulse">Loading posts...</span>
            ) : totalPosts === 0 && searchTerm ? (
              `No posts found for "${searchTerm}"`
            ) : (
              `Showing ${posts.length} of ${totalPosts} post${
                totalPosts !== 1 ? "s" : ""
              } (Page ${currentPage} of ${totalPages})`
            )}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: postsPerPage }).map((_, index) => (
              <PostCardSkeleton key={index} />
            ))}
          </div>
        ) : totalPosts.length === 0 && !searchTerm ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Posts Yet
            </h3>
            <p className="text-gray-500">
              Be the first to share something amazing!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const displayBtns = user && user._id === post.author._id;

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                >
                  {editingPostId === post.id ? (
                    <div className="p-6">
                      <PostForm
                        initialData={{
                          title: post.title,
                          content: post.content,
                          imageUrl: post.imageUrl,
                        }}
                        onSubmit={handleEditSubmit}
                        onCancel={handleCancelEdit}
                        isLoading={isSubmitting}
                      />
                    </div>
                  ) : (
                    <>
                      {post.imageUrl && (
                        <div className="relative overflow-hidden">
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                      )}

                      <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                          {post.title}
                        </h2>

                        <ExpandableText text={post.content} limit={150} />

                        <div className="flex justify-between items-center">
                          {/* author */}
                          <div className="flex justify-between items-center gap-1">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {post.author.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center gap-1">
                              <p className="text-xs text-gray-600">Author:</p>
                              <p className="text-xs font-medium text-gray-600">
                                {post.author.username
                                  .split(" ")
                                  .map(
                                    (name) =>
                                      name.charAt(0).toUpperCase() +
                                      name.slice(1).toLowerCase()
                                  )
                                  .join(" ")}
                              </p>
                            </div>
                          </div>
                          {/* date */}
                          <div className="flex justify-between items-center gap-1">
                            <p className="text-xs text-gray-600">Date:</p>
                            <p className="text-xs font-medium text-gray-600">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {displayBtns && (
                          <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => handleEditClick(post)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(post)}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
      {/* Floating Button */}
      {user && (
        <button
          onClick={openNewPostModal}
          className="cursor-pointer fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          title="Create New Post"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
        </button>
      )}

      {/* New Post Modal */}
      <PostModal
        isOpen={isNewPostModalOpen}
        onClose={closeNewPostModal}
        title="Create New Post"
      >
        <PostForm
          onSubmit={handleSubmitNewPost}
          onCancel={closeNewPostModal}
          isLoading={isSubmittingNewPost}
        />
      </PostModal>
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this post?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, postId: null })}
      />
    </div>
  );
};

export default PostsList;
