// Mock service for Users

const initialUsers = [
  { id: 1, name: 'Super Admin', email: 'super@example.com', role: 'Super Admin' },
  { id: 2, name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
  { id: 3, name: 'Content Editor', email: 'editor@example.com', role: 'Content Editor' },
  { id: 4, name: 'Student User', email: 'student@example.com', role: 'Student' },
];

const getUsersFromStorage = () => {
  if (typeof window === 'undefined') return [];
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : initialUsers;
};

const saveUsersToStorage = (users) => {
  localStorage.setItem('users', JSON.stringify(users));
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const userService = {
  async getUsers() {
    await delay(300);
    return { data: getUsersFromStorage() };
  },
  async createUser(data) {
    await delay(300);
    const users = getUsersFromStorage();
    const newUser = { id: Date.now(), ...data };
    const updatedUsers = [...users, newUser];
    saveUsersToStorage(updatedUsers);
    return newUser;
  },
  async updateUser(id, data) {
    await delay(300);
    let users = getUsersFromStorage();
    users = users.map((user) => (user.id === id ? { ...user, ...data } : user));
    saveUsersToStorage(users);
    return users.find((user) => user.id === id);
  },
  async deleteUser(id) {
    await delay(300);
    let users = getUsersFromStorage();
    users = users.filter((user) => user.id !== id);
    saveUsersToStorage(users);
    return { success: true };
  },
};

export const ROLES = ['Super Admin', 'Admin', 'Content Editor', 'Reviewer', 'Analyst', 'Student'];
