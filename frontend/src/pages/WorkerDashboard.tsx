import { useState, useEffect } from 'react';
import { fetchFromApi } from '../api';
import type { Task } from '../types';

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await fetchFromApi('worker/tasks');
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Failed to load tasks", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (task: Task) => {
    // Ideally call assign API here
    // await fetchFromApi(`worker/tasks/${task.taskId}/assign`, { method: 'POST' });
    setActiveTask(task);
    setAnswer('');
  };

  const handleSubmit = async () => {
    if (!activeTask) return;
    setSubmitting(true);
    try {
        await fetchFromApi(`worker/tasks/${activeTask.taskId}/submit`, {
            method: 'POST',
            body: JSON.stringify({
                assignmentId: 'auto-assigned', // Simplify for MVP
                result: answer
            })
        });
        alert('Task submitted!');
        setActiveTask(null);
        // Refresh tasks
        loadTasks();
    } catch (e) {
        console.error(e);
        alert('Submission failed');
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate mb-6">
        Worker Workspace
      </h2>

      {!activeTask ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? <p>Loading tasks...</p> : tasks.length === 0 ? <p>No available tasks found.</p> : tasks.map((task) => (
                <div key={task.taskId} className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            {task.type}
                        </span>
                        {/* Reward is not strictly in Task model yet, would be part of payload if we saved it there */}
                        <span className="text-green-600 font-bold">${task.payload?.reward || '0.50'}</span>
                    </div>

                    <h3 className="font-bold text-md mb-2 truncate">Task #{task.taskId.slice(0,8)}</h3>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                        {task.payload?.question || "Perform the requested task."}
                    </p>

                    <button
                        onClick={() => handleStart(task)}
                        className="w-full bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded text-sm hover:bg-indigo-50 font-medium transition-colors"
                    >
                        Start Task
                    </button>
                </div>
            ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <button onClick={() => setActiveTask(null)} className="text-indigo-600 hover:text-indigo-800 mb-4 font-medium flex items-center">
                    &larr; Back to List
                </button>
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <span className="inline-block px-2 py-1 mb-2 text-xs font-semibold text-white bg-indigo-500 rounded">{activeTask.type}</span>
                    <h3 className="text-xl font-bold mb-2">Task Instruction</h3>
                    <p className="text-gray-800 text-lg">
                        {activeTask.payload?.question}
                    </p>
                    {activeTask.type === 'image-labeling' && activeTask.payload.imageUrl && (
                        <img src={activeTask.payload.imageUrl} alt="Task" className="mt-4 max-h-96 rounded shadow-sm" />
                    )}
                    {activeTask.type === 'text-classification' && activeTask.payload.text && (
                        <div className="mt-4 p-4 bg-white border rounded shadow-inner font-mono text-sm">
                            {activeTask.payload.text}
                        </div>
                    )}
                </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
            <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full border rounded-md p-3 h-32 mb-4 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Type your answer here..."
            />

            <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`w-full text-white py-3 rounded-md font-bold ${submitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
            >
                {submitting ? 'Submitting...' : 'Submit Work'}
            </button>
        </div>
      )}
    </div>
  );
}
