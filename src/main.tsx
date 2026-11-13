import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled app error caught by RootErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF8ED] flex items-center justify-center p-6 text-[#2B0D08]">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-amber-200 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-700">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold font-serif mb-2 text-stone-900">বস্ত্র শৈলী (BOSTROSHOILY) স্টোর লোড করতে সাময়িক বিলম্ব হচ্ছে</h2>
            <p className="text-sm text-stone-600 mb-6">
              পেজটি রিলোড করে আবার চেষ্টা করুন অথবা ব্রাউজার রিফ্রেশ করুন।
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('bastra_cart');
                  } catch {}
                  window.location.reload();
                }}
                className="w-full py-3 bg-[#8C2D19] hover:bg-[#732414] text-white font-medium rounded-xl shadow transition"
              >
                পেজ রিলোড করুন
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                }}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-xl transition"
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
