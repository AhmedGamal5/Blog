import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/shared/ConfirmModal";
import PostForm from "../components/shared/PostForm";
import toast from "react-hot-toast";
import {
  getCommentsByPostId,
  updateComment,
  deleteComment,
} from "../services/commentService";
import AddCommentForm from "../components/AddCommentForm";
import ReactionButtons from "../components/reactions/ReactionButtons";

const COMMENTS_PER_PAGE = 5;
const PostDetailSkeleton = () => (
  <div className="container mx-auto max-w-3xl px-4 py-8 animate-pulse">
    <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
    <div className="flex items-center mb-6">
      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full mr-3"></div>
      <div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-1"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
      </div>
    </div>
    <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/6"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  </div>
);

const PostDetailPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  //** for delete buttons ***/
  const navigate = useNavigate();
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);
  //** for edit buttons ***/
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  //*** for comments ****/
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState("");
  const [currentCommentsPage, setCurrentCommentsPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [commentsTotalPages, setCommentsTotalPages] = useState(1);

  //**** for editing vomments*******/
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [isSubmittingCommentUpdate, setIsSubmittingCommentUpdate] =
    useState(false);

  //**** for deleting comments ******/
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [isConfirmCommentDeleteModalOpen, setIsConfirmCommentDeleteModalOpen] =
    useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get(`/posts/${postId}`);         
         
        setPost({
          ...res.data,
          id: res.data._id,  
          reactionCounts: new Map(
            Object.entries(res.data.reactionCounts || {})  
          ),
          userReactions: new Map(
            Object.entries(res.data.userReactions || {})  
          ),
        });
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load post. It might not exist or there was a network issue."
        );
        toast.error("Failed to load post."); 
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]); 

  //**** handle delete post functionality *****/
  const openDeleteModal = () => {
    setIsConfirmDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setIsConfirmDeleteModalOpen(false);
  };
  const handleConfirmDeletePost = async () => {
    try {
      await API.delete(`/posts/${post._id}`);
      toast.success("Post deleted successfully");
      closeDeleteModal();
      navigate("/posts");
    } catch (err) {
      console.error("Failed to delete post:", err);
      toast.error(err.response?.data?.message || "Failed to delete post.");
      closeDeleteModal();
    }
  };

  //**** handle edit post functionality *****/
  const handleEditClick = () => {
    setIsEditing(true);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  const handleUpdatePost = async (formData) => {
    setIsSubmittingEdit(true);
    try {
      const res = await API.put(`/posts/${post._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setPost({ ...res.data, id: res.data._id });
      //   console.log("tsssss>>>>>>>>>>>>>")
      toast.success("Post updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update post:", err);
      toast.error("Failed to update post.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  //**** Handle comments*****/
  const fetchCommentsCallback = useCallback(
    async (page) => {
      if (!postId) return;
      setCommentsLoading(true);
      setCommentsError("");
      try {
        const res = await getCommentsByPostId(postId, page, COMMENTS_PER_PAGE);
        if (page === 1) {
          setComments(res.data.data);
        } else {
          setComments((prevComments) => [...prevComments, ...res.data.data]);
        }
        setTotalComments(res.data.total);
        setCommentsTotalPages(res.data.totalPages);
        setCurrentCommentsPage(page);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
        const errMsg = "Failed to load comments.";
        setCommentsError(errMsg);
      } finally {
        setCommentsLoading(false);
      }
    },
    [postId]
  );

  useEffect(() => {
    if (postId) {
      fetchCommentsCallback(1);
    }
  }, [postId, fetchCommentsCallback]);

  const handleLoadMoreComments = () => {
    if (currentCommentsPage < commentsTotalPages) {
      fetchCommentsCallback(currentCommentsPage + 1);
    }
  };

  const handleCommentAdded = () => {
    setCurrentCommentsPage(1);
    fetchCommentsCallback(1);
  };

  //******* handle edit comments functionality *********/
  const handleEditCommentClick = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentContent(comment.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  };

  const handleSaveCommentUpdate = async () => {
    if (!editingCommentId || !editingCommentContent.trim()) {
      toast.error("Comment content cannot be empty.");
      return;
    }
    setIsSubmittingCommentUpdate(true);
    try {
      const updatedCommentData = await updateComment(editingCommentId, {
        content: editingCommentContent,
      });
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === editingCommentId
            ? {
                ...comment,
                ...updatedCommentData.data,
                content: editingCommentContent,
              } // Ensure structure matches
            : comment
        )
      );
      toast.success("Comment updated successfully!");
      handleCancelEditComment();
    } catch (err) {
      console.error("Failed to update comment:", err);
      toast.error(err.response?.data?.message || "Failed to update comment.");
    } finally {
      setIsSubmittingCommentUpdate(false);
    }
  };

  //**** handle delete comments functionality ****/
  const openCommentDeleteModal = (commentId) => {
    setDeletingCommentId(commentId);
    setIsConfirmCommentDeleteModalOpen(true);
  };

  const closeCommentDeleteModal = () => {
    setDeletingCommentId(null);
    setIsConfirmCommentDeleteModalOpen(false);
  };

  const handleConfirmCommentDelete = async () => {
    if (!deletingCommentId) return;

    try {
      await deleteComment(deletingCommentId);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== deletingCommentId)
      );
      setTotalComments((prevTotal) => prevTotal - 1);
      toast.success("Comment deleted successfully!");
    } catch (err) {
      console.error("Failed to delete comment:", err);
      toast.error("Failed to delete comment.");
    } finally {
      closeCommentDeleteModal();
    }
  };

  //****Handle Reaction with posts ******/
  const handleReactionToggledInDetail = (
    updatedPostData,
    newUserReactionType
  ) => {
    setPost((prevPost) => {
      if (!prevPost || prevPost._id !== updatedPostData._id) return prevPost;
      return {
        ...prevPost,
        reactionCounts: new Map(
          Object.entries(updatedPostData.reactionCounts || {})
        ),

        userReactions: new Map(
          Object.entries(updatedPostData.userReactions || {})
        ),
      };
    });
  };

  //****Handle loading and Erros ******/
  if (loading) {
    return <PostDetailSkeleton />;
  }
  if (error) {
    return (
      <div className="min-h-screen dark:bg-gray-900 py-8 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold text-red-500 mb-4">Error</h2>
          <p className="text-gray-300">{error}</p>
          <Link
            to="/posts"
            className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Posts
          </Link>
        </div>
      </div>
    );
  }
  if (!post) {
    return (
      <div className="min-h-screen dark:bg-gray-900 py-8 text-center">
        <div className="container mx-auto px-4">
          <p className="text-xl text-gray-400">Post not found.</p>
          <Link
            to="/posts"
            className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Posts
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = user && post.author && user._id === post.author._id;

  const currentUserReactionType =
    user && post.userReactions
      ? post.userReactions.get(user._id) || null
      : null;
  const reactionCountsAsMap = new Map(
    Object.entries(post.reactionCounts || {})
  );

  return (
    <div className="min-h-screen dark:bg-gray-900 py-8">
      <div className="container mx-auto max-w-3xl px-4">
        {isEditing ? (
          <div className="bg-gray-200 shadow-xl rounded-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Edit Post
            </h2>
            <PostForm
              initialData={{
                title: post.title,
                content: post.content,
                imageUrl: post.imageUrl,
              }}
              onSubmit={handleUpdatePost}
              onCancel={handleCancelEdit}
              isLoading={isSubmittingEdit}
            />
          </div>
        ) : (
          <article className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-auto max-h-96 object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <div className="p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {post.title}
              </h1>

              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-6">
                {post.author ? (
                  <>
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold">
                        {post.author.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span>By {post.author.username}</span>
                    <span className="mx-2">•</span>
                  </>
                ) : (
                  <span>By Anonymous</span>
                )}
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                {post.content.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/**** REACTION BUTTONS ****/}
              {post && postId && (
                <div className="px-6 md:px-8 py-4">
                  <ReactionButtons
                    postId={postId}
                    initialReactionCounts={reactionCountsAsMap}
                    initialUserReaction={currentUserReactionType}
                    onReactionToggled={handleReactionToggledInDetail}
                  />
                </div>
              )}
              {/**** END REACTION BUTTONS ****/}

              {isAuthor && !isEditing && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-4">
                  <button
                    onClick={handleEditClick}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                    disabled={isSubmittingEdit}
                  >
                    Edit Post
                  </button>
                  <button
                    onClick={openDeleteModal}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                  >
                    Delete Post
                  </button>
                </div>
              )}

              <div className="p-6 md:p-8 mt-2">
                <Link
                  to="/posts"
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  &larr; Back to all posts
                </Link>
              </div>
            </div>
          </article>
        )}
        {/****--- Comments Section --- ****/}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Comments ({totalComments})
          </h2>

          {/****  --- Add Comment Form --- ****/}
          {user && postId && (
            <AddCommentForm
              postId={postId}
              onCommentAdded={handleCommentAdded}
            />
          )}
          {!user && (
            <div className="p-4 mb-6 text-sm text-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">
              Please{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >
                login
              </Link>{" "}
              to add a comment or reply.
            </div>
          )}
          {commentsLoading && currentCommentsPage === 1 && (
            <p className="text-gray-500 dark:text-gray-400">
              Loading comments...
            </p>
          )}
          {commentsError && <p className="text-red-500">{commentsError}</p>}

          {!commentsLoading &&
            !commentsError &&
            comments.length === 0 &&
            totalComments === 0 && (
              <p className="text-gray-500 dark:text-gray-400">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}

          {comments.length > 0 && (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">
                        {comment.author?.username?.charAt(0)?.toUpperCase() ||
                          "A"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {comment.author?.username || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                          {" at "}
                          {new Date(comment.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {editingCommentId === comment._id ? (
                        <div className="mt-2">
                          <textarea
                            value={editingCommentContent}
                            onChange={(e) =>
                              setEditingCommentContent(e.target.value)
                            }
                            rows="3"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            disabled={isSubmittingCommentUpdate}
                          />
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={handleSaveCommentUpdate}
                              disabled={
                                isSubmittingCommentUpdate ||
                                !editingCommentContent.trim()
                              }
                              className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded disabled:opacity-50"
                            >
                              {isSubmittingCommentUpdate ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={handleCancelEditComment}
                              disabled={isSubmittingCommentUpdate}
                              className="px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {comment.content}
                          </p>
                          {user &&
                            comment.author &&
                            user._id === comment.author._id && (
                              <div className="mt-2 flex space-x-3">
                                <button
                                  onClick={() =>
                                    handleEditCommentClick(comment)
                                  }
                                  className="text-xs text-blue-500 hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    openCommentDeleteModal(comment._id)
                                  } // <-- MODIFIED
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Comments Button */}
          {!commentsError &&
            comments.length > 0 &&
            currentCommentsPage < commentsTotalPages && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMoreComments}
                  disabled={commentsLoading}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {commentsLoading ? "Loading..." : "Load More Comments"}
                </button>
              </div>
            )}
          {commentsLoading && currentCommentsPage > 1 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
              Loading more comments...
            </p>
          )}
        </div>

        {/**-----------------------------------------------------------------------------**/}
      </div>
      <ConfirmModal
        isOpen={isConfirmDeleteModalOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDeletePost}
        onCancel={closeDeleteModal}
      />
      {/*Confirm Delete Modal for COMMENTS */}
      <ConfirmModal
        isOpen={isConfirmCommentDeleteModalOpen}
        title="Confirm Delete Comment"
        message="Are you sure you want to delete this comment?"
        confirmText="Delete Comment"
        cancelText="Cancel"
        onConfirm={handleConfirmCommentDelete}
        onCancel={closeCommentDeleteModal}
      />
    </div>
  );
};

export default PostDetailPage;
