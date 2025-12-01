import React, { useEffect, useState } from 'react';
import { get } from 'aws-amplify/api';
import { Briefcase, CheckCircle, AlertCircle } from 'lucide-react';

interface Task {
  taskId: string;
  type: string;
  payload: {
    instructions: string;
    // Agregamos otros campos que podrían venir en el payload
    [key: string]: any;
  };
  status: string;
  reward?: number;
}

interface WorkerDashboardProps {
  onSelectTask: (task: Task) => void;
  initialTasks?: Task[];
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ onSelectTask, initialTasks }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [loading, setLoading] = useState(!initialTasks);

  useEffect(() => {
    if (!initialTasks) {
      fetchTasks();
    }
  }, [initialTasks]);

  const fetchTasks = async () => {
    try {
      const restOperation = get({
        apiName: 'CrowdsourcingApi',
        path: '/worker/tasks'
      });
      const response = await restOperation.response;
      const body = await response.body.json();
      setTasks((body as any).tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando tareas disponibles...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Tareas Disponibles</h2>

      {tasks.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-lg border-2 border-dashed">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No hay tareas disponibles</h3>
          <p className="text-gray-500 mt-2">Vuelve a intentarlo más tarde.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.taskId}
              className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => onSelectTask(task)}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full uppercase">
                  {task.type.replace('-', ' ')}
                </span>
                <span className="font-bold text-lg text-green-600">
                  ${task.reward || '0.10'}
                </span>
              </div>

              <h3 className="font-bold text-lg text-gray-800 mb-2 truncate group-hover:text-indigo-600">
                {task.payload.instructions || 'Tarea de etiquetado'}
              </h3>

              <p className="text-gray-600 text-sm mb-6 h-10 overflow-hidden">
                {task.payload.instructions || 'Ayúdanos a categorizar y verificar datos.'}
              </p>

              <button
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center justify-center group-hover:scale-105"
              >
                <CheckCircle size={18} className="mr-2" /> Empezar Tarea
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
