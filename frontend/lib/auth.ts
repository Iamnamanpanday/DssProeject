'use client';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const AUTH_KEY = 'neuros_auth_user';

export const signUp = (name: string, email: string): User => {
  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    email,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
  return newUser;
};

export const signIn = (email: string): User | null => {
  // Simple check for simulation: if email is not empty, sign in
  const storedUser = localStorage.getItem(AUTH_KEY);
  if (storedUser) {
    const user = JSON.parse(storedUser);
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

export const signOut = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const storedUser = localStorage.getItem(AUTH_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
