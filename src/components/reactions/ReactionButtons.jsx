import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { togglePostReaction } from "../../services/reactionService";
import toast from "react-hot-toast";

const REACTION_TYPES = {
  LIKE: {
    icon: "👍",
    label: "Like",
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  LOVE: {
    icon: "❤️",
    label: "Love",
    color: "text-red-500",
    bgColor: "bg-red-100",
  },
  HAHA: {
    icon: "😂",
    label: "Haha",
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
  },
  WOW: {
    icon: "😮",
    label: "Wow",
    color: "text-indigo-500",
    bgColor: "bg-indigo-100",
  },
  SAD: {
    icon: "😢",
    label: "Sad",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  },
  ANGRY: {
    icon: "😠",
    label: "Angry",
    color: "text-orange-500",
    bgColor: "bg-orange-100",
  },
};
const REACTION_ORDER = ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"];

const ReactionButtons = ({
  postId,
  initialReactionCounts,
  initialUserReaction,
  onReactionToggled,
  className,
}) => {
  const { user } = useAuth();
  const [reactionCounts, setReactionCounts] = useState(
    new Map(initialReactionCounts)
  );
  const [currentUserReaction, setCurrentUserReaction] =
    useState(initialUserReaction);
  const [isLoading, setIsLoading] = useState(null);

  useEffect(() => {
    setReactionCounts(new Map(initialReactionCounts));
  }, [initialReactionCounts]);

  useEffect(() => {
    setCurrentUserReaction(initialUserReaction);
  }, [initialUserReaction]);

  const handleReactionClick = async (reactionType) => {
    if (!user) {
      toast.error("Please login to react.");
      return;
    }
    if (isLoading) return;

    setIsLoading(reactionType);

    const oldReactionCounts = new Map(reactionCounts);
    const oldUserReaction = currentUserReaction;

    setCurrentUserReaction((prevUserReaction) => {
      const newCounts = new Map(oldReactionCounts);
      let newUserReaction = reactionType;

      if (prevUserReaction) {
        newCounts.set(
          prevUserReaction,
          (newCounts.get(prevUserReaction) || 1) - 1
        );
      }

      if (prevUserReaction === reactionType) {
        newUserReaction = null;
      } else {
        newCounts.set(reactionType, (newCounts.get(reactionType) || 0) + 1);
      }

      for (const [type, count] of newCounts.entries()) {
        if (count <= 0) {
          newCounts.delete(type);
        }
      }
      setReactionCounts(newCounts);
      return newUserReaction;
    });

    try {
      const response = await togglePostReaction(postId, reactionType);
      if (onReactionToggled) {
        onReactionToggled(
          response.data.post,
          response.data.currentUserReaction
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update reaction."
      );
      console.error("Reaction error:", error);
      setReactionCounts(oldReactionCounts);
      setCurrentUserReaction(oldUserReaction);
    } finally {
      setIsLoading(null);
    }
  };
const rootDivClassName = `
    flex flex-wrap gap-2 items-center mt-4 py-2 
    border-t border-b dark:border-gray-700 mb-2 
    ${className || ''} 
  `.replace(/\s+/g, ' ').trim(); 
  return (
    <div className={rootDivClassName}>
      {REACTION_ORDER.map((reactionKey) => {
        const reactionConfig = REACTION_TYPES[reactionKey];
        const count = reactionCounts.get(reactionKey.toLowerCase()) || 0;
        const isActive = currentUserReaction === reactionKey.toLowerCase();

        return (
          <button
            key={reactionKey}
            onClick={() => handleReactionClick(reactionKey.toLowerCase())}
            disabled={isLoading === reactionKey.toLowerCase()}
            title={reactionConfig.label}
            className={`flex items-center space-x-1 px-1 py-1 rounded-full text-xs font-medium transition-colors duration-150  hover:-translate-y-1
                        ${
                          isActive
                            ? `${reactionConfig.color} ${
                                reactionConfig.bgColor
                              } dark:bg-opacity-30 ring-1 ${reactionConfig.color.replace(
                                "text-",
                                "ring-"
                              )}`
                            : `text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-200`
                        }
                        ${
                          isLoading === reactionKey.toLowerCase()
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      `}
          >
            <span className="text-sm">{reactionConfig.icon}</span>
            {count > 0 && (
              <span
                className={
                  isActive
                    ? reactionConfig.color
                    : "text-gray-600 dark:text-gray-400"
                }
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ReactionButtons;
