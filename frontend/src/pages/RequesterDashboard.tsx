import { useState } from 'react';

export default function RequesterDashboard() {
  const [tasks, setTasks] = useState<{question: string, reward: number}[]>([]);
  const [input, setInput] = useState('');
  const [reward, setReward] = useState(0.5);

  const handleAddTask = () => {
    if (!input) return;
    setTasks([...tasks, { question: input, reward }]);
    setInput('');
  };

  const handlePublish = async () => {
    alert('Tasks published (Mocked)! check console for payload.');
    console.log('Publishing batch:', tasks);
    setTasks([]);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate mb-6">
        Requester Dashboard
      </h2>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900">Create New Tasks</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label htmlFor="question" className="block text-sm font-medium text-gray-700">
              Task Question
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="question"
                id="question"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="e.g., Is this image offensive?"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="reward" className="block text-sm font-medium text-gray-700">
              Reward ($)
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="reward"
                id="reward"
                value={reward}
                onChange={(e) => setReward(parseFloat(e.target.value))}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
            <button
              onClick={handleAddTask}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              Add to Batch
            </button>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Batch Preview</h3>
          <ul className="divide-y divide-gray-200 mb-6">
            {tasks.map((task, idx) => (
              <li key={idx} className="py-4 flex justify-between">
                <span>{task.question}</span>
                <span className="text-green-600 font-bold">${task.reward.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={handlePublish}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none"
          >
            Publish Batch ({tasks.length} tasks)
          </button>
        </div>
      )}
    </div>
  );
}
