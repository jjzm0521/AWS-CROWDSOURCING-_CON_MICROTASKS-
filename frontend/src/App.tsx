import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import { WorkerDashboard } from './components/WorkerDashboard';
import { TaskWorkspace } from './components/TaskWorkspace';

// Configure Amplify
Amplify.configure(awsExports);

function App() {
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xl font-bold text-blue-600">CrowdTasker</span>
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
            {!selectedTask ? (
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
