import API from '../api/axios';  

export const getPostsByAuthorId = (authorId, page = 1, limit = 10) => {
  return API.get(`/posts/author/${authorId}?page=${page}&limit=${limit}`);
};