import { GoogleAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Button } from '../ui/Button';

interface SocialLoginButtonsProps {
  onSocialLogin: (token: string) => Promise<void>;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ onSocialLogin }) => {
  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      await onSocialLogin(token);
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleAppleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const provider = new OAuthProvider('apple.com');
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      await onSocialLogin(token);
    } catch (error) {
      console.error('Apple login error:', error);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <Button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 hover:bg-gray-100"
      >
        <img src="/google.svg" alt="Google" className="w-5 h-5" />
        Google ile devam et
      </Button>
      <Button
        type="button"
        onClick={handleAppleLogin}
        className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-900"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M17.05 20.28c-.98.95-2.05.88-3.08.41-1.09-.47-2.07-.48-3.23 0-1.44.62-2.2.44-3.06-.41C3.32 16.09 4.43 8.82 9.08 8.47c1.16.07 1.98.65 2.71.65.73 0 2.11-.65 3.55-.5 1.22.12 2.77.91 3.62 2.47-3.39 2.21-2.85 6.65.09 8.37-.67 1.18-1.58 2.37-2 2.82zM12.03 8.37C11.88 5.71 14.08 3.5 16.56 3.5c.28 2.78-2.03 4.98-4.53 4.87z"
          />
        </svg>
        Apple ile devam et
      </Button>
    </div>
  );
}; 