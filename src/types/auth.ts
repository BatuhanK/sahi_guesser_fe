export interface User {
  id: number;
  username: string;
  score: number;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  passwordConfirm: string;
}
