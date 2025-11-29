import React, { useState, useEffect } from 'react';
import { post } from 'aws-amplify/api';
import { ArrowLeft, Check, Lock, Info, AlertTriangle } from 'lucide-react';

interface Task {
  taskId: string;
  type: string;
  payload: {
    imageUrl?: string;
    instructions?: string;
    [key: string]: any;
  };
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

  useEffect(() => {
    // Cuando la tarea se monta, la asignamos automáticamente
    handleAssign();
  }, [task.taskId]);

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

      if (data.assignmentId) {
        setAssignmentId(data.assignmentId);
      } else {
        // Si no hay assignmentId, la tarea puede no estar disponible
        setError(data.message || 'La tarea ya no está disponible o fue asignada a otro trabajador.');
      }
    } catch (err: any) {
      console.error(err);
      const errorBody = await err.response?.body.json();
      setError(errorBody?.message || 'Error al aceptar la tarea.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentId || !answer) return;

    setLoading(true);
    try {
      const restOperation = post({
        apiName: 'CrowdsourcingApi',
        path: `/worker/tasks/${task.taskId}/submit`,
        options: { body: { assignmentId, answer } }
      });
      await restOperation.response;
      onComplete(); // Llamar a onComplete que gestionará el mensaje de éxito
    } catch (err) {
      console.error(err);
      setError('Error al enviar la respuesta.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    const { payload } = task;
    if (payload.imageUrl) {
      return <img src={payload.imageUrl} alt="Contenido de la tarea" className="w-full h-auto rounded-lg border-2 border-gray-200" />;
    }
    return <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(payload, null, 2)}</pre>;
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-white shadow-lg rounded-lg mt-10">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">Ocurrió un error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={onBack} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">
          Volver al listado
        </button>
      </div>
    );
  }

  if (!assignmentId) {
    return <div className="p-8 text-center text-gray-500">Aceptando tarea, por favor espera...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button onClick={onBack} className="flex items-center text-sm text-gray-600 hover:text-indigo-600 mb-6 font-medium">
        <ArrowLeft size={16} className="mr-2" /> Volver al listado
      </button>

      <div className="bg-white shadow-xl rounded-lg border border-gray-200">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Espacio de Trabajo</h2>
          <span className="text-sm text-indigo-600 font-semibold uppercase">{task.type.replace('-', ' ')}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Columna Izquierda: Contenido de la Tarea */}
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
              <h3 className="font-bold text-lg text-blue-800 flex items-center mb-2">
                <Info size={20} className="mr-2"/> Instrucciones
              </h3>
              <p className="text-blue-700">
                {task.payload.instructions || 'Por favor, completa la tarea siguiendo las indicaciones.'}
              </p>
            </div>
            {renderContent()}
          </div>

          {/* Columna Derecha: Área de Respuesta */}
          <div className="bg-gray-50 p-6 border-l">
            <form onSubmit={handleSubmit} className="sticky top-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Tu Respuesta</h3>
              <p className="text-sm text-gray-500 mb-3">Introduce tu respuesta en el siguiente campo de texto. Asegúrate de seguir las instrucciones.</p>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-3 border rounded-lg h-40 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="Escribe tu respuesta aquí..."
                required
              />
              <button
                type="submit"
                disabled={loading || !answer}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={20} className="mr-2" /> {loading ? 'Enviando...' : 'Enviar Trabajo'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
