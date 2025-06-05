import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserPublicProfile } from '../services/userService';  
import { getPostsByAuthorId } from '../services/postService';   
import toast from 'react-hot-toast';

import PostCardSkeleton from '../components/PostCardSkeleton'; 
import PaginationControls from '../components/PaginationControls'; 
import ReactionButtons from '../components/reactions/ReactionButtons'; 

const POSTS_PER_PAGE = 6;  

const UserProfilePage = () => {
  const { userId } = useParams();  
  const { user: loggedInUser } = useAuth();  

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPostsPage, setCurrentPostsPage] = useState(1);
  const [totalUserPosts, setTotalUserPosts] = useState(0);
  const [postsTotalPages, setPostsTotalPages] = useState(1);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setProfileLoading(true);
      setError('');
      try {
        const response = await getUserPublicProfile(userId);
        setProfileUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        const errMsg = err.response?.data?.message || "Could not load user profile.";
        setError(errMsg);
        toast.error(errMsg);
        setProfileUser(null);  
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const fetchUserPosts = useCallback(async (pageToFetch) => {
    if (!userId) return;
    setPostsLoading(true);
    // setError(''); // Keep existing error or clear specific to posts?
    try {
      const response = await getPostsByAuthorId(userId, pageToFetch, POSTS_PER_PAGE);
      const { data, total, totalPages } = response.data;

      const postsWithProcessedReactions = data.map(post => ({
        ...post,
        id: post._id, // Alias if needed
        reactionCounts: new Map(Object.entries(post.reactionCounts || {})),
        userReactions: new Map(Object.entries(post.userReactions || {})),
      }));

      setUserPosts(postsWithProcessedReactions);
      setTotalUserPosts(total);
      setPostsTotalPages(totalPages);
      setCurrentPostsPage(pageToFetch);
    } catch (err) {
      console.error("Failed to fetch user posts:", err);
      const errMsg = err.response?.data?.message || "Could not load user's posts.";
      // setError(errMsg); // Decide if this should overwrite profile error
      toast.error(errMsg);
    } finally {
      setPostsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserPosts(currentPostsPage);
  }, [userId, currentPostsPage, fetchUserPosts]);

  const handlePostPageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= postsTotalPages) {
      setCurrentPostsPage(pageNumber);
    }
  };

  // Callback for ReactionButtons on user's posts list
  const handleReactionToggledInProfilePosts = (updatedPostData, newUserReactionType) => {
    setUserPosts(prevPosts =>
      prevPosts.map(p =>
        p._id === updatedPostData._id
          ? {
              ...p,
              ...updatedPostData,
              reactionCounts: new Map(Object.entries(updatedPostData.reactionCounts || {})),
              userReactions: new Map(Object.entries(updatedPostData.userReactions || {})),
            }
          : p
      )
    );
  };


  if (profileLoading) {
    return <div className="text-center py-10 dark:text-gray-300">Loading profile...</div>;
  }

  if (error && !profileUser) {  
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!profileUser) {
    return <div className="text-center py-10 dark:text-gray-300">User not found.</div>;
  }

  const isOwnProfile = loggedInUser && loggedInUser._id === profileUser._id;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 sm:mb-0 sm:mr-6 overflow-hidden border-2 border-white dark:border-gray-700"> {/* Added overflow-hidden and border */}
              {profileUser.profilePictureUrl ? (
                <img src={profileUser.profilePictureUrl} alt={profileUser.username} className="w-full h-full object-cover" />
              ) : (
                profileUser.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profileUser.username}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Joined: {new Date(profileUser.createdAt).toLocaleDateString()}
              </p>
              {isOwnProfile && (
                <Link 
                  to={`/profile/edit`}  
                  className="mt-3 inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors"
                >
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
        </div>

     
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
            Posts by {profileUser.username} ({totalUserPosts})
          </h2>
          {postsLoading && userPosts.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: POSTS_PER_PAGE }).map((_, index) => (
                <PostCardSkeleton key={index} />
              ))}
            </div>
          ) : userPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">  
                {userPosts.map(post => {
                  const currentUserReactionTypeForThisPost = loggedInUser && post.userReactions
                    ? post.userReactions.get(loggedInUser._id) || null
                    : null;
                  
                  return (
                    <div key={post._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                      {post.imageUrl && (
                        <Link to={`/posts/${post._id}`}>
                          <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover"/>
                        </Link>
                      )}
                      <div className="p-4">
                        <Link to={`/posts/${post._id}`}>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2">{post.title}</h3>
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                        
                        <ReactionButtons
                            postId={post._id}
                            initialReactionCounts={post.reactionCounts}  
                            initialUserReaction={currentUserReactionTypeForThisPost}
                            onReactionToggled={(updatedPostData) => handleReactionToggledInProfilePosts(updatedPostData, null)}
                        />
                      </div>
                       {isOwnProfile && (  
                        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2">
                            <Link to={`/posts/${post._id}/edit`} className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded">Edit</Link>
                        </div>
                       )}
                    </div>
                  );
                })}
              </div>
              {postsTotalPages > 1 && (
                <PaginationControls
                  currentPage={currentPostsPage}
                  totalPages={postsTotalPages}
                  onPageChange={handlePostPageChange}
                />
              )}
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-5">
              {profileUser.username} hasn't posted anything yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;