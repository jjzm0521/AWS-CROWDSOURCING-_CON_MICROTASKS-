'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import React from 'react';

export default function AuthGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    // DEMO MODE: Bypass authentication for visualization
    return (
        <div className="w-full min-h-screen">
            {children}
        </div>
    );
}
