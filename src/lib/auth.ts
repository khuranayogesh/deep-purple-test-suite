export interface User {
  username: string;
  userType: 'User' | 'Administrator';
}

export const validateLogin = (username: string, password: string, userType: string): User | null => {
  const credentials = [
    { username: 'admin', password: 'admin', userType: 'Administrator' },
    { username: 'user01', password: 'user01', userType: 'User' }
  ];

  const user = credentials.find(
    cred => cred.username === username && 
           cred.password === password && 
           cred.userType === userType
  );

  return user ? { username: user.username, userType: user.userType as 'User' | 'Administrator' } : null;
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem('currentUser');
};