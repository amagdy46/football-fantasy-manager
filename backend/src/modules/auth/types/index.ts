export interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface AuthCredentials {
  email: string;
  password: string;
}
