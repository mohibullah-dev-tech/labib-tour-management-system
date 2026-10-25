import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_HOME_PATH } from '@/features/auth/constants/permissions';
import { env } from '@/config/env';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number | string;
            },
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

function SocialLoginButton() {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const handleCredentialSuccess = async (credential: string) => {
    try {
      setIsSubmitting(true);
      const user = await googleLogin(credential);
      toast.success(`Welcome, ${user.fullName}!`);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? ROLE_HOME_PATH[user.role], { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Google sign-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!env.googleClientId) return;

    const scriptId = 'google-gsi-client';
    const initGsi = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        window.google.accounts.id.initialize({
          client_id: env.googleClientId,
          callback: (res) => handleCredentialSuccess(res.credential),
        });

        // Render official Google button into container
        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: '100%',
        });
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.body.appendChild(script);
    } else {
      initGsi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env.googleClientId]);

  const handleCustomButtonClick = () => {
    if (env.googleClientId) {
      // Trigger prompt if button container hasn't loaded
      window.google?.accounts?.id?.prompt();
    } else {
      // Show setup dialog with 1-click test simulation
      setSetupModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs">OR</span>
        <Separator className="flex-1" />
      </div>

      {env.googleClientId ? (
        <div ref={googleBtnContainerRef} className="flex min-h-[40px] w-full justify-center" />
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          disabled={isSubmitting}
          onClick={handleCustomButtonClick}
        >
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </Button>
      )}

      {/* Setup & Test Helper Dialog when GOOGLE_CLIENT_ID is not yet configured */}
      <Dialog open={setupModalOpen} onOpenChange={setSetupModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GoogleIcon /> Google Sign-In Setup & Test
            </DialogTitle>
            <DialogDescription>
              Google OAuth backend is ready! You can test Google login right now, or configure your
              own Google Client ID.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            <div className="border-primary/20 bg-primary/5 space-y-2 rounded-lg border p-3.5">
              <p className="text-foreground font-semibold">Option 1: Test Login Instantly</p>
              <p className="text-muted-foreground text-xs">
                Simulates real Google authentication with backend verification, database user
                creation, and full dashboard redirect.
              </p>
              <Button
                className="mt-1 w-full gap-2"
                onClick={() => {
                  setSetupModalOpen(false);
                  handleCredentialSuccess('demo-google-token');
                }}
              >
                <GoogleIcon />
                Sign in with Google Test Account
              </Button>
            </div>

            <div className="bg-muted/40 space-y-1.5 rounded-lg border p-3 text-xs">
              <p className="text-foreground font-medium">Option 2: Use Real Google Client ID</p>
              <ol className="text-muted-foreground list-decimal space-y-1 pl-4">
                <li>
                  Go to{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    Google Cloud Console
                  </a>
                </li>
                <li>Create an OAuth 2.0 Client ID (Web application)</li>
                <li>
                  Add authorized Javascript origins:{' '}
                  <code className="bg-muted px-1">http://localhost:5173</code>
                </li>
                <li>
                  Add <code className="bg-muted px-1">VITE_GOOGLE_CLIENT_ID=your_id</code> to{' '}
                  <code className="bg-muted px-1">client/.env</code>
                </li>
                <li>
                  Add <code className="bg-muted px-1">GOOGLE_CLIENT_ID=your_id</code> to{' '}
                  <code className="bg-muted px-1">server/.env</code>
                </li>
              </ol>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.1C3.24 21.3 7.28 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.26a12 12 0 0 0 0 10.78l4.01-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.26 6.61l4.01 3.1C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export { SocialLoginButton };
