import { useState, useEffect } from 'react';
import { fetchFromApi } from '../api';
import type { TaskInput } from '../types';
import FileUpload from '../components/FileUpload';
import { registerUser } from '../services/storage';

const TASK_TYPES = [
  { value: 'generic', label: 'Generic Question' },
  { value: 'image-labeling', label: 'Image Labeling' },
  { value: 'text-classification', label: 'Text Classification' },
  { value: 'transcription', label: 'Audio Transcription' },
];

export default function RequesterDashboard() {
  const [tasks, setTasks] = useState<TaskInput[]>([]);
  const [createdTasks, setCreatedTasks] = useState<any[]>([]); // For "Database of Created Tasks"
  const [taskType, setTaskType] = useState('generic');
  const [question, setQuestion] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [textToClassify, setTextToClassify] = useState('');
  const [reward, setReward] = useState(0.5);
  const [isPublishing, setIsPublishing] = useState(false);
  const [user, setUser] = useState<{name: string, id: string} | null>(null);

  // Load existing tasks on mount
  useEffect(() => {
     if (user) {
         loadCreatedTasks();
     }
  }, [user]);

  const loadCreatedTasks = async () => {
      // We need an endpoint to list tasks for a requester.
      // reusing GET /requester/tasks which calls list_tasks.py
      // We need to ensure list_tasks.py uses the current requester context.
      // Since we don't have real auth, we should pass requesterId?
      // But list_tasks.py might be hardcoded or depend on token.
      // For this demo, we'll try to fetch.
      try {
          // Temporarily Mocked for visual if API doesn't support query params yet
          // Actually, we can update list_tasks.py to filter by query param if needed,
          // but let's see what it does. It scans or queries?
          // It's likely returning all tasks for the requester from token.
          // Since we use "demo-requester" or similar if no token, it might just work.
          const data = await fetchFromApi('requester/tasks');
          if (data.tasks) setCreatedTasks(data.tasks);
      } catch (e) {
          console.error("Failed to load history", e);
      }
  };

  const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const name = (form.elements.namedItem('name') as HTMLInputElement).value;
      const id = name.toLowerCase().replace(/\s/g, '-');

      try {
        await registerUser(id, 'Requester', name);
        setUser({ name, id });
        localStorage.setItem('requester_id', id); // Store for persistence/API usage if we wired it
      } catch (err) {
          alert('Registration failed');
      }
  };

  const handleAddTask = () => {
    let payload: any = {};

    if (taskType === 'generic') {
      if (!question) return;
      payload = { question };
    } else if (taskType === 'image-labeling') {
      if (!imageUrl || !question) return;
      payload = { imageUrl, question };
    } else if (taskType === 'text-classification') {
      if (!textToClassify || !question) return;
      payload = { text: textToClassify, question };
    } else if (taskType === 'transcription') {
        if (!imageUrl) return;
        payload = { audioUrl: imageUrl };
    }

    setTasks([...tasks, {
      type: taskType,
      payload: { ...payload, reward },
      reward
    }]);

    setQuestion('');
    setImageUrl('');
    setTextToClassify('');
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const batchResponse = await fetchFromApi('requester/tasks/batch', {
        method: 'POST',
        body: JSON.stringify({
            requesterId: user?.id, // Pass the ID we just registered
            tasks: tasks.map(t => ({
                type: t.type,
                payload: t.payload,
                isGold: false
            }))
        })
      });

      await fetchFromApi(`requester/tasks/${batchResponse.batchId}/publish`, {
        method: 'POST'
      });

      alert(`Successfully published batch ${batchResponse.batchId}!`);
      setTasks([]);
      loadCreatedTasks(); // Refresh history

    } catch (error) {
      console.error('Failed to publish:', error);
      alert('Failed to publish tasks.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Helper to construct public URL from key (assuming public bucket in us-east-1)
  const getPublicUrl = (key: string) => {
      // TODO: Ideally inject Bucket Name via ENV
      // For now, we return the key.
      // If the user uses the FileUpload, they get a key "assets/uuid-name".
      // We need to prepend the S3 public URL.
      // Let's assume us-east-1 and standard naming if not provided.
      // But we don't have the bucket name here easily.
      // Hack: We can ask the user to input the bucket name once or hardcode if we know it from previous step?
      // Wait, we deployed and got an output. But the REACT app is built.
      // We should put the BUCKET_URL in .env
      return `https://${import.meta.env.VITE_ASSET_BUCKET_NAME || 'crowdsourcing-assets'}.s3.amazonaws.com/${key}`;
  };

  if (!user) {
      return (
          <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Requester Login</h2>
              <form onSubmit={handleRegister}>
                  <label className="block text-sm font-medium text-gray-700">Name / Organization</label>
                  <input name="name" type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 mb-4" />
                  <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                      Enter Dashboard
                  </button>
              </form>
          </div>
      )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Requester Dashboard</h2>
        <div className="text-right">
            <p className="text-sm text-gray-500">Logged in as:</p>
            <p className="font-bold">{user.name}</p>
        </div>
      </div>

      <div className="mb-8 border-b pb-8">
        <h3 className="text-lg font-medium text-gray-900">Create New Tasks</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

          <div className="sm:col-span-3">
            <label htmlFor="taskType" className="block text-sm font-medium text-gray-700">Task Type</label>
            <select
              id="taskType"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="reward" className="block text-sm font-medium text-gray-700">Reward ($)</label>
            <input
              type="number"
              id="reward"
              value={reward}
              onChange={(e) => setReward(parseFloat(e.target.value))}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div className="sm:col-span-6 border-t pt-4">
             {taskType === 'generic' && (
               <div>
                 <label className="block text-sm font-medium text-gray-700">Question</label>
                 <input type="text" value={question} onChange={e => setQuestion(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
               </div>
             )}

             {(taskType === 'image-labeling' || taskType === 'transcription') && (
               <div className="grid grid-cols-1 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Upload Media</label>
                    <FileUpload onUploadComplete={(key) => setImageUrl(getPublicUrl(key))} />
                    {imageUrl && <p className="text-xs text-green-600 mt-1">Uploaded: {imageUrl.split('/').pop()}</p>}
                 </div>
                 {taskType === 'image-labeling' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Question</label>
                        <input type="text" value={question} onChange={e => setQuestion(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                    </div>
                 )}
               </div>
             )}

             {taskType === 'text-classification' && (
               <div className="grid grid-cols-1 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Text to Classify</label>
                    <textarea value={textToClassify} onChange={e => setTextToClassify(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Instruction</label>
                    <input type="text" value={question} onChange={e => setQuestion(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                 </div>
               </div>
             )}
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

      {/* Batch Preview */}
      {tasks.length > 0 && (
        <div className="border-b border-gray-200 pb-8 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Batch ({tasks.length})</h3>
          <ul className="divide-y divide-gray-200 mb-6 bg-gray-50 rounded p-4">
            {tasks.map((task, idx) => (
              <li key={idx} className="py-2 flex justify-between text-sm">
                <span>{task.type} - {task.payload.question || 'Media Task'}</span>
                <span className="font-bold">${task.reward?.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isPublishing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isPublishing ? 'Publishing...' : `Publish Batch`}
          </button>
        </div>
      )}

      {/* Created Tasks History */}
      <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Created Tasks Database</h3>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
             {createdTasks.length === 0 ? (
                 <p className="text-gray-500">No tasks history found.</p>
             ) : (
                 <table className="min-w-full divide-y divide-gray-200">
                     <thead>
                         <tr>
                             <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                             <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                             <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                             <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200">
                         {createdTasks.map((task: any) => (
                             <tr key={task.taskId}>
                                 <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{task.taskId.slice(0,8)}...</td>
                                 <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{task.type}</td>
                                 <td className="px-3 py-2 whitespace-nowrap text-xs">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${task.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                         {task.status}
                                     </span>
                                 </td>
                                 <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{new Date(task.createdAt).toLocaleDateString()}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             )}
          </div>
      </div>

    </div>
  );
}
