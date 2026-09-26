import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Mathmate App Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-bold shadow-xl mb-4">
            Σ
          </div>
          <h1 className="text-xl font-bold mb-2">Mathmate লোড হতে সমস্যা হয়েছে</h1>
          <p className="text-sm text-slate-400 max-w-sm mb-6">
            অ্যাপটি রিফ্রেশ করলে ঠিক হয়ে যাবে। অনুগ্রহ করে নিচের বাটনে চাপ দিন।
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-medium rounded-xl transition"
          >
            রিফ্রেশ করুন (Reload)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
