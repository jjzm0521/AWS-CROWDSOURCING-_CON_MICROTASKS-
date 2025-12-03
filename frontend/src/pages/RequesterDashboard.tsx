import { useState } from 'react';
import { fetchFromApi } from '../api';
import type { TaskInput } from '../types';

const TASK_TYPES = [
  { value: 'generic', label: 'Generic Question' },
  { value: 'image-labeling', label: 'Image Labeling' },
  { value: 'text-classification', label: 'Text Classification' },
  { value: 'transcription', label: 'Audio Transcription' },
];

export default function RequesterDashboard() {
  const [tasks, setTasks] = useState<TaskInput[]>([]);
  const [taskType, setTaskType] = useState('generic');
  const [question, setQuestion] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [textToClassify, setTextToClassify] = useState('');
  const [reward, setReward] = useState(0.5);
  const [isPublishing, setIsPublishing] = useState(false);

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
        if (!imageUrl) return; // reusing imageUrl input for audio url for simplicity
        payload = { audioUrl: imageUrl };
    }

    setTasks([...tasks, {
      type: taskType,
      payload: { ...payload, reward }, // Embedding reward in payload for display/logic
      reward
    }]);

    // Reset fields
    setQuestion('');
    setImageUrl('');
    setTextToClassify('');
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // 1. Create Batch
      const batchResponse = await fetchFromApi('requester/tasks/batch', {
        method: 'POST',
        body: JSON.stringify({
            // Assuming hardcoded requesterId for now as per handler logic
            tasks: tasks.map(t => ({
                type: t.type,
                payload: t.payload,
                isGold: false
            }))
        })
      });

      console.log('Batch Created:', batchResponse);

      // 2. Publish Batch
      const publishResponse = await fetchFromApi(`requester/tasks/${batchResponse.batchId}/publish`, {
        method: 'POST'
      });

      console.log('Batch Published:', publishResponse);
      alert(`Successfully published batch ${batchResponse.batchId} with ${tasks.length} tasks!`);
      setTasks([]);

    } catch (error) {
      console.error('Failed to publish:', error);
      alert('Failed to publish tasks. See console for details.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate mb-6">
        Requester Dashboard
      </h2>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900">Create New Tasks</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

          <div className="sm:col-span-3">
            <label htmlFor="taskType" className="block text-sm font-medium text-gray-700">Task Type</label>
            <select
              id="taskType"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-6 border-t pt-4">
             {/* Dynamic Fields based on Type */}
             {taskType === 'generic' && (
               <div>
                 <label className="block text-sm font-medium text-gray-700">Question / Instruction</label>
                 <input type="text" value={question} onChange={e => setQuestion(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g. Answer this survey..." />
               </div>
             )}

             {taskType === 'image-labeling' && (
               <div className="grid grid-cols-1 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="https://..." />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Question</label>
                    <input type="text" value={question} onChange={e => setQuestion(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="What is in this image?" />
                 </div>
               </div>
             )}

             {taskType === 'text-classification' && (
               <div className="grid grid-cols-1 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Text to Classify</label>
                    <textarea value={textToClassify} onChange={e => setTextToClassify(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Enter text here..." />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Instruction</label>
                    <input type="text" value={question} onChange={e => setQuestion(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Is this positive or negative?" />
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

      {tasks.length > 0 && (
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Batch Preview</h3>
          <ul className="divide-y divide-gray-200 mb-6">
            {tasks.map((task, idx) => (
              <li key={idx} className="py-4 flex justify-between items-center">
                <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        {task.type}
                    </span>
                    <span className="text-gray-700 truncate max-w-lg inline-block align-middle">
                        {task.payload.question || task.payload.text || 'Task Item'}
                    </span>
                </div>
                <span className="text-green-600 font-bold">${task.reward?.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isPublishing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} focus:outline-none`}
          >
            {isPublishing ? 'Publishing...' : `Publish Batch (${tasks.length} tasks)`}
          </button>
        </div>
      )}
    </div>
  );
}
