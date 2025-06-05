import API from '../api/axios';  

export const getCurrentUserProfile = () => {
  return API.get('/users/profile');
};
 
export const getUserPublicProfile = (userId) => {
  return API.get(`/users/${userId}/profile`);
};

 
export const updateUserProfile = (profileData) => {  
  return API.put('/users/profile', profileData);
};

export const uploadProfilePicture = (formData) => { 
  return API.post('/users/profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', 
    },
  });
}