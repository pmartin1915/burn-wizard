import React from 'react';

interface TourErrorBoundaryProps {
  children: React.ReactNode;
  onError?: () => void;
}

interface TourErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class TourErrorBoundary extends React.Component<TourErrorBoundaryProps, TourErrorBoundaryState> {
  constructor(props: TourErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): TourErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Tour Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // Store error info for debugging
    this.setState({
      hasError: true,
      error,
      errorInfo
    });

    // Call the error callback if provided
    if (this.props.onError) {
      try {
        this.props.onError();
      } catch (callbackError) {
        console.error('🚨 Tour Error Boundary: Error in callback:', callbackError);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI for tour errors
      return (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-red-200 dark:border-red-700 p-6 max-w-md w-full">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 dark:text-red-400 text-lg">⚠️</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                  Tour Error
                </h3>
                <p className="text-red-800 dark:text-red-200 text-sm mb-4">
                  The guided tour encountered an error and needs to be reset. This is likely due to a navigation issue.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      try {
                        // Clean up any tour elements
                        const tourElements = document.querySelectorAll('.tour-highlight');
                        tourElements.forEach(el => {
                          el.classList.remove('tour-highlight');
                        });
                        
                        // Reset error boundary state
                        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                      } catch (error) {
                        console.error('🚨 Error boundary reset failed:', error);
                        // Force page reload as last resort
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Reset Tour
                  </button>
                  <button
                    onClick={() => {
                      try {
                        // Close the tour completely
                        if (this.props.onError) {
                          this.props.onError();
                        }
                        
                        // Clean up tour elements
                        const tourElements = document.querySelectorAll('.tour-highlight');
                        tourElements.forEach(el => {
                          el.classList.remove('tour-highlight');
                        });
                        
                        // Reset error boundary
                        this.setState({ hasError: false });
                      } catch (error) {
                        console.error('🚨 Error boundary close failed:', error);
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Close Tour
                  </button>
                </div>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-3 text-xs">
                    <summary className="cursor-pointer text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100">
                      Debug Info
                    </summary>
                    <pre className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-900 dark:text-red-100 overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}