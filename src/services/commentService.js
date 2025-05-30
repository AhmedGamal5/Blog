import API from "../api/axios";

export const createComment = (postId, commentData) =>
  API.post(`/posts/${postId}/comments`, commentData);

export const getCommentsByPostId = (postId, page = 1, limit = 10) =>
  API.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`);

export const updateComment = (commentId, commentData) =>
  API.put(`/comments/${commentId}`, commentData);

export const deleteComment = (commentId) =>
  API.delete(`/comments/${commentId}`);

export const getCommentById = (commentId) => API.get(`/comments/${commentId}`);

