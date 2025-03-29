import { useEffect } from 'react';
import { Redirect, Route } from 'wouter';
import { useAuth } from '@/lib/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  component: React.ComponentType;
  path: string;
}

export function ProtectedRoute({ component: Component, path }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, token, verifyToken } = useAuth();

  useEffect(() => {
    // If we have a token but aren't authenticated yet, verify the token
    if (token && !isAuthenticated && !isLoading) {
      verifyToken();
    }
  }, [token, isAuthenticated, isLoading, verifyToken]);
  
  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isAuthenticated ? (
        <Component />
      ) : (
        <Redirect to="/auth" />
      )}
    </Route>
  );
}