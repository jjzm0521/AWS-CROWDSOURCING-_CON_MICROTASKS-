import React, { useEffect, useState } from 'react';
import { get } from 'aws-amplify/api';
import { Clock } from 'lucide-react';

interface Task {
  taskId: string;
  type: string;
  payload: any;
  status: string;
  reward?: number; // Asumiendo que agregaremos reward luego
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

  if (loading) return <div className="p-8 text-center">Cargando tareas disponibles...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Tareas Disponibles</h2>

      {tasks.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded text-center">
          <p>No hay tareas disponibles en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div key={task.taskId} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded uppercase">
                  {task.type}
                </span>
                <span className="text-gray-500 text-sm flex items-center">
                  <Clock size={14} className="mr-1" /> 10 min
                </span>
              </div>

              <h3 className="font-semibold text-lg mb-2">Identificar objetos</h3>
              <p className="text-gray-600 text-sm mb-4 truncate">
                {JSON.stringify(task.payload)}
              </p>

              <button
                onClick={() => onSelectTask(task)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-medium"
              >
                Ver Tarea
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
