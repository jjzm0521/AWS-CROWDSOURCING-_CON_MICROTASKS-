'use client';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from '../lib/aws-exports';
import React from 'react';

// Initialize Amplify
Amplify.configure(awsExports);

export default function AmplifyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Authenticator.Provider>
      <div className="w-full min-h-screen">
        {children}
      </div>
    </Authenticator.Provider>
  );
}
