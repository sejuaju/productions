"use client"

import React, { useState } from 'react';

interface BetaBannerProps {
    variant?: 'header' | 'top-banner' | 'footer' | 'modal';
    dismissible?: boolean;
    className?: string;
}

const BetaBanner: React.FC<BetaBannerProps> = ({
    variant = 'header',
    dismissible = false,
    className = ''
}) => {
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed) return null;

    const variants = {
        header: {
            container: "px-2 py-1 text-xs font-bold bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full shadow-lg animate-pulse",
            text: "BETA"
        },
        'top-banner': {
            container: "w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 px-4 text-center relative",
            text: "🚧 This is a BETA version - Use at your own risk. Features may be unstable."
        },
        footer: {
            container: "text-xs text-[var(--text-secondary)] bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2",
            text: "⚠️ Beta Version - This application is in beta testing phase"
        },
        modal: {
            container: "bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4 mb-4",
            text: "🚧 Beta Notice: This feature is currently in beta testing. Please use with caution and report any issues."
        }
    };

    const currentVariant = variants[variant];

    return (
        <div className={`${currentVariant.container} ${className}`}>
            <div className="flex items-center justify-between">
                <span className={variant === 'top-banner' ? 'text-sm font-medium' : ''}>
                    {currentVariant.text}
                </span>
                {dismissible && (
                    <button
                        onClick={() => setIsDismissed(true)}
                        className="ml-2 text-white/80 hover:text-white transition-colors"
                        aria-label="Dismiss beta notice"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default BetaBanner;