const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const fetchUsers = async (page = 1, letter = null, searchTerm = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '50',
  });

  if (letter) {
    params.append('letter', letter);
  }

  if (searchTerm) {
    params.append('search', searchTerm);
  }

  const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return response.json();
};

export default {
  fetchUsers,
};
