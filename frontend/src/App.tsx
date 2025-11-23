import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import { WorkerDashboard } from './components/WorkerDashboard';
import { TaskWorkspace } from './components/TaskWorkspace';
import { RequesterDashboard } from './components/RequesterDashboard';

// Configure Amplify
Amplify.configure(awsExports);

type ViewMode = 'worker' | 'requester';

function App() {
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('worker');

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
              <div className="flex items-center space-x-8">
                <span className="text-xl font-bold text-blue-600">CrowdTasker</span>

                {/* Navigation Links */}
                <div className="hidden md:flex space-x-4">
                  <button
                    onClick={() => {
                      setViewMode('worker');
                      setSelectedTask(null);
                    }}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'worker'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    Soy Worker
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('requester');
                      setSelectedTask(null);
                    }}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'requester'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    Soy Requester
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Hola, {user?.username}</span>
                <button
                  onClick={signOut}
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {viewMode === 'requester' ? (
              <RequesterDashboard />
            ) : !selectedTask ? (
              <WorkerDashboard onSelectTask={setSelectedTask} />
            ) : (
              <TaskWorkspace
                task={selectedTask}
                onBack={() => setSelectedTask(null)}
                onComplete={() => setSelectedTask(null)}
              />
            )}
          </main>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
