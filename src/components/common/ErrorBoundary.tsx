
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center space-y-8 p-10 bg-white rounded-[3rem] shadow-2xl border border-gray-100">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">عذراً، حدث خطأ ما</h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                نواجه بعض الصعوبات التقنية حالياً. يرجى محاولة إعادة تحميل الصفحة.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primaryDark transition-all"
            >
              إعادة تحميل الصفحة
            </button>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-red-50 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-red-800 text-xs whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
