import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';

export interface NetworkErrorStateProps {
  onRetry?: () => void;
}

/** Shown when an auth request fails due to a network/connectivity issue rather than invalid credentials — distinct messaging matters here since the fix is "try again," not "check your password." */
function NetworkErrorState({ onRetry }: NetworkErrorStateProps) {
  return (
    <EmptyState
      icon={WifiOff}
      title="Connection problem"
      description="We couldn't reach the server. Check your internet connection and try again."
      action={
        onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        )
      }
    />
  );
}

export { NetworkErrorState };
