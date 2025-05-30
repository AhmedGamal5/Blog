import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createComment} from '../services/commentService'  
import toast from 'react-hot-toast';

const AddCommentForm = ({ postId, onCommentAdded }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Comment content cannot be empty.');
      return;
    }
    if (!user) {
      toast.error("You must be logged in to comment.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await createComment(postId, { content });
      toast.success('Comment added successfully!');
      setContent('');  
      if (onCommentAdded) {
        onCommentAdded(); 
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      const errMsg = err.response?.data?.message || 'Failed to submit comment.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 mb-6 text-sm text-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">
        Please <a href="/login" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">login</a> to add a comment.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Add a Comment</h3>
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment here..."
          rows="4"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          disabled={isSubmitting}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>}
      <div className="mt-3 text-right">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition ease-in-out duration-150"
        >
          {isSubmitting ? 'Submitting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};

export default AddCommentForm;