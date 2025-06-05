import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ExpandableText from "../ExpandableText";
import PostForm from "./PostForm";
import ReactionButtons from "../reactions/ReactionButtons";
import TimeAgo from "./TimeAgo";

const PostCard = ({
  post,
  onDeletePost,
  onEditClick,
  isEditing,
  onEditSubmit,
  onEditCancel,
  isSubmittingEdit,
  onReactionToggled,
  showAdminControls = true, 
}) => {
  const { user } = useAuth();

  const canModify = showAdminControls && user && post.author && user._id === post.author._id;

  const currentUserReactionType =
    user && post.userReactions
      ? post.userReactions.get(user._id) || null
      : null;
  
  const reactionCounts = post.reactionCounts;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group">
      {isEditing ? (
        <div className="p-6">
          <PostForm
            initialData={{
              title: post.title,
              content: post.content,
              imageUrl: post.imageUrl,
            }}
            onSubmit={onEditSubmit}
            onCancel={onEditCancel}
            isLoading={isSubmittingEdit}
          />
        </div>
      ) : (
        <>
          {post.imageUrl && (
            <Link to={`/posts/${post._id}`} className="block">
              <div className="relative overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </Link>
          )}

          <div className="p-6">
            <Link to={`/posts/${post._id}`}>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400">
                {post.title}
              </h2>
            </Link>

            {post.content && <ExpandableText text={post.content} limit={150} />}

            <div className="flex justify-between items-center mt-4 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Link to={`/profile/${post.author?._id}`}>
                  {post.author?.profilePictureUrl ? (
                    <img src={post.author.profilePictureUrl} alt={post.author.username} className="w-6 h-6 rounded-full object-cover"/>
                  ) : (
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {post.author?.username?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    </div>
                  )}
                </Link>
                <Link to={`/profile/${post.author?._id}`}>
                  <p className="font-medium hover:underline">
                    {post.author?.username || 'Unknown Author'}
                  </p>
                </Link>
              </div>
              <TimeAgo timestamp={post.createdAt} />
            </div>

            <div className="mt-4">
              <ReactionButtons
                postId={post._id}
                className={"border-t-0 border-b-0 py-1"}  
                initialReactionCounts={reactionCounts}
                initialUserReaction={currentUserReactionType}
                onReactionToggled={(updatedPost) => onReactionToggled(updatedPost, null)}
              />
            </div>

            {canModify && (
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <button
                  onClick={() => onEditClick(post)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center justify-center space-x-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeletePost(post)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center justify-center space-x-2"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PostCard;