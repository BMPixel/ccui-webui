import React from 'react';
import { Button } from './Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

const DefaultErrorFallback = ({ error, resetError }: ErrorFallbackProps) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-red-50 border border-red-200 rounded-lg">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-red-800 mb-2">Something went wrong</h2>
      <p className="text-red-600 mb-4">
        {error?.message || 'An unexpected error occurred'}
      </p>
      <details className="mb-4 text-sm text-red-700">
        <summary className="cursor-pointer hover:text-red-800">Error details</summary>
        <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
          {error?.stack || 'No stack trace available'}
        </pre>
      </details>
      <Button onClick={resetError} variant="outline">
        Try Again
      </Button>
    </div>
  </div>
); 