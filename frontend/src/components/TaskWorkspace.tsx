import React, { useState } from 'react';
import { post } from 'aws-amplify/api';
import { ArrowLeft, Check, Lock } from 'lucide-react';

interface Task {
  taskId: string;
  type: string;
  payload: any;
}

interface TaskWorkspaceProps {
  task: Task;
  onBack: () => void;
  onComplete: () => void;
}

export const TaskWorkspace: React.FC<TaskWorkspaceProps> = ({ task, onBack, onComplete }) => {
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAssign = async () => {
    setLoading(true);
    setError('');
    try {
      const restOperation = post({
        apiName: 'CrowdsourcingApi',
        path: `/worker/tasks/${task.taskId}/assign`
      });
      const response = await restOperation.response;
      const data: any = await response.body.json();
      setAssignmentId(data.assignmentId);
    } catch (err) {
      console.error(err);
      setError('Error al asignar la tarea. Puede que ya no esté disponible.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentId) return;

    setLoading(true);
    try {
      const restOperation = post({
        apiName: 'CrowdsourcingApi',
        path: `/worker/tasks/${task.taskId}/submit`,
        options: {
          body: {
            assignmentId,
            answer
          }
        }
      });
      await restOperation.response;
      alert('¡Tarea completada con éxito!');
      onComplete();
    } catch (err) {
      console.error(err);
      setError('Error al enviar la respuesta.');
    } finally {
      setLoading(false);
    }
  };

  // Render Task Content based on type (Simplified for demo)
  const renderContent = () => {
    const payload = task.payload || {};
    // Example for image task
    if (payload.imageUrl) {
        return <img src={payload.imageUrl} alt="Task Subject" className="max-w-full h-auto rounded mb-4 border" />;
    }
    return <pre className="bg-gray-100 p-4 rounded mb-4 overflow-auto">{JSON.stringify(payload, null, 2)}</pre>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg mt-6">
      <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} className="mr-2" /> Volver al listado
      </button>

      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold">Tarea: {task.taskId}</h2>
        <span className="text-sm text-gray-500 uppercase tracking-wide">{task.type}</span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-4 border-l-4 border-red-500">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Col: Task Content */}
        <div>
          <h3 className="font-semibold mb-3 text-lg">Instrucciones & Contenido</h3>
          {renderContent()}
        </div>

        {/* Right Col: Action Area */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          {!assignmentId ? (
            <div className="text-center py-8">
              <Lock size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="mb-6 text-gray-600">Debes aceptar esta tarea para comenzar a trabajar. Tienes 10 minutos para completarla una vez aceptada.</p>
              <button
                onClick={handleAssign}
                disabled={loading}
                className="bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow hover:bg-green-700 transition w-full disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Aceptar y Trabajar'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 className="font-semibold mb-3">Tu Respuesta</h3>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-3 border rounded h-32 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Escribe tu respuesta aquí..."
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded w-full font-bold hover:bg-blue-700 transition flex justify-center items-center disabled:opacity-50"
              >
                {loading ? 'Enviando...' : <><Check size={20} className="mr-2" /> Enviar Trabajo</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
