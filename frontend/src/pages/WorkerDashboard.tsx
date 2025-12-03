import { useState } from 'react';

export default function WorkerDashboard() {
  const [tasks] = useState([
    { taskId: '1', question: 'Does this image contain a cat?', reward: 0.50, status: 'Available' },
    { taskId: '2', question: 'Transcribe the audio clip.', reward: 1.20, status: 'Available' },
    { taskId: '3', question: 'Is the text sentiment positive?', reward: 0.10, status: 'Available' },
  ]);

  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');

  const handleStart = (taskId: string) => {
    setActiveTask(taskId);
    setAnswer('');
  };

  const handleSubmit = () => {
    alert('Task submitted! ID: ' + activeTask);
    setActiveTask(null);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate mb-6">
        Worker Workspace
      </h2>

      {!activeTask ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
                <div key={task.taskId} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-lg mb-2">Task #{task.taskId}</h3>
                    <p className="text-gray-600 mb-4">{task.question}</p>
                    <div className="flex justify-between items-center">
                        <span className="text-green-600 font-bold">${task.reward.toFixed(2)}</span>
                        <button
                            onClick={() => handleStart(task.taskId)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700"
                        >
                            Start Task
                        </button>
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <button onClick={() => setActiveTask(null)} className="text-indigo-600 hover:text-indigo-800 mb-4">
                    &larr; Back to List
                </button>
                <h3 className="text-xl font-bold">Completing Task #{activeTask}</h3>
                <p className="text-gray-600 mt-2">
                    {tasks.find(t => t.taskId === activeTask)?.question}
                </p>
            </div>

            <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full border rounded-md p-3 h-32 mb-4"
                placeholder="Type your answer here..."
            />

            <button
                onClick={handleSubmit}
                className="w-full bg-green-600 text-white py-3 rounded-md font-bold hover:bg-green-700"
            >
                Submit Work
            </button>
        </div>
      )}
    </div>
  );
}
