export interface User {
  id: number;
  username: string;
  email: string | null;
  firebaseUid: string | null;
  emailVerified: boolean;
  score: number;
  isPremium: boolean;
  premiumLevel: number;
  premiumStartTs: string | null;
  premiumEndTs: string | null;
  role: string;
  isBanned: boolean;
  bannedUntil: string | null;
  pushToken: string | null;
  lastOnlineAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  passwordConfirm: string;
}
