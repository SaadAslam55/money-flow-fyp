// src/pages/ErrorPage.tsx
/**
 * Error Page Component
 * Displays error information when an unexpected error occurs
 * Handles route errors, network errors, and other application errors
 */

import { useEffect } from 'react';
import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTemplate } from '@/components/common/PageTemplate';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';

export default function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();

  // Extract error information
  let errorTitle = 'Something went wrong';
  let errorMessage = 'An unexpected error occurred. Please try again.';
  let errorStatus: number | null = null;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorTitle = `${error.status} - ${error.statusText ?? 'Error'}`;
    errorMessage = error.data?.message || error.statusText || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  // Track error page view
  useEffect(() => {
    trackPageView('/error', `Error ${errorStatus ?? 'Unknown'}`);
    const errorType = isRouteErrorResponse(error)
      ? 'route_error'
      : error instanceof Error
        ? 'error'
        : 'unknown';
    trackUserAction(
      'error_page_viewed',
      'error',
      `status_${errorStatus ?? 'unknown'}_type_${errorType}`
    );
  }, [errorStatus, errorMessage, error]);

  const handleGoHome = () => {
    trackUserAction('error_go_home_clicked', 'error', `status_${errorStatus ?? 'unknown'}`);
    navigate('/dashboard', { replace: true });
  };

  const handleGoBack = () => {
    trackUserAction('error_go_back_clicked', 'error', `status_${errorStatus ?? 'unknown'}`);
    navigate(-1);
  };

  const handleReload = () => {
    trackUserAction('error_reload_clicked', 'error', `status_${errorStatus ?? 'unknown'}`);
    window.location.reload();
  };

  return (
    <PageTemplate
      title="Error"
      description="An error occurred while loading this page"
      showHeader={false}
      className="flex min-h-screen items-center justify-center"
    >
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold">
            {errorStatus ? `${errorStatus}` : 'Oops!'}
          </CardTitle>
          <CardDescription className="mt-2 text-lg">{errorTitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">{errorMessage}</p>
            {errorStatus === 404 && (
              <p className="mt-2 text-sm text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
              </p>
            )}
            {errorStatus === 500 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Our servers encountered an error. We're working to fix it.
              </p>
            )}
          </div>

          <div className="flex flex-col justify-center gap-2 pt-4 sm:flex-row">
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={handleReload} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
            <Button onClick={handleGoHome}>
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>

          {/* Development error details */}
          {(import.meta as { env?: { DEV?: boolean } }).env?.DEV &&
            error !== null &&
            error !== undefined && (
              <details className="mt-6 rounded-lg bg-muted p-4">
                <summary className="mb-2 cursor-pointer text-sm font-medium">
                  Error Details (Development Only)
                </summary>
                <div className="overflow-auto text-xs">
                  <pre>
                    {JSON.stringify(
                      error instanceof Error
                        ? {
                            name: error.name,
                            message: error.message,
                            stack: error.stack,
                          }
                        : typeof error === 'object' && error !== null
                          ? error
                          : String(error),
                      null,
                      2
                    )}
                  </pre>
                </div>
              </details>
            )}
        </CardContent>
      </Card>
    </PageTemplate>
  );
}
