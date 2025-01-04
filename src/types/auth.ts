export interface User {
  id: number;
  username: string;
  score: number;
  role: string;
  email: string;
  emailVerified: boolean;
  isAnonymous: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  passwordConfirm: string;
}
