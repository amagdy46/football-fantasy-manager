export interface User {
  id: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}
