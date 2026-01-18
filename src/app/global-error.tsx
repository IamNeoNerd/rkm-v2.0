'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
    error: Error & { digest?: string };
    reset: () => void;
}

/**
 * Global Error Boundary Component
 * 
 * This component catches errors in the React tree and displays
 * a user-friendly error page with recovery options.
 */
export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
    useEffect(() => {
        // Log error to console in development
        console.error('Global error caught:', error);

        // In production, you might want to send to an error tracking service
        // e.g., Sentry, LogRocket, etc.
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 p-4">
                    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-red-200 dark:border-red-900 p-8 text-center">
                        {/* Error Icon */}
                        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Something went wrong
                        </h1>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            We apologize for the inconvenience. An unexpected error occurred.
                            Please try again or contact support if the problem persists.
                        </p>

                        {/* Error Details (Development Only) */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6 text-left">
                                <p className="text-sm font-mono text-red-700 dark:text-red-300 break-all">
                                    {error.message}
                                </p>
                                {error.digest && (
                                    <p className="text-xs text-red-500 mt-2">
                                        Error ID: {error.digest}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={reset}
                                className="gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/'}
                                className="gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Go Home
                            </Button>
                        </div>

                        {/* Support Info */}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-6">
                            If this issue continues, please contact support with the error details.
                        </p>
                    </div>
                </div>
            </body>
        </html>
    );
}
