'use client';

import { Component, type ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

type Props = {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};

type State = {
    hasError: boolean;
    error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[SIPEDA ErrorBoundary]', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center px-4 text-center">
                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <AlertTriangle className="w-7 h-7 text-red-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Terjadi Kesalahan</h2>
                    <p className="text-sm text-gray-500 mb-6 max-w-sm">
                        Bagian ini bermasalah. Silakan coba lagi atau hubungi admin jika terus terjadi.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => this.setState({ hasError: false, error: null })}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors text-sm">
                            <RefreshCw className="w-4 h-4" />
                            Coba Lagi
                        </button>
                        <Link href="/"
                            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                            <Home className="w-4 h-4" />
                            Beranda
                        </Link>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
