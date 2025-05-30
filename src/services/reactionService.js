import API from "../api/axios";

export const togglePostReaction = (postId, reactionType) => {
  return API.post(`/posts/${postId}/react`, { type: reactionType });
};

export const getDetailedReactionsForPost = (postId) => {
  return API.get(`/posts/${postId}/reactions/detailed`);
};
