import React, { useEffect, useState } from 'react';
import { get, post } from 'aws-amplify/api';
import { Upload, FileJson, Play, CheckSquare } from 'lucide-react';

export const RequesterDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchMyTasks();
  }, [refreshTrigger]);

  const fetchMyTasks = async () => {
    try {
      const restOperation = get({
        apiName: 'CrowdsourcingApi',
        path: '/requester/tasks'
      });
      const response = await restOperation.response;
      const data: any = await response.body.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateBatch = async () => {
    try {
      setLoading(true);
      const parsedTasks = JSON.parse(jsonInput);

      // Estructura esperada: { tasks: [...] }
      const payload = Array.isArray(parsedTasks) ? { tasks: parsedTasks } : parsedTasks;

      const restOperation = post({
        apiName: 'CrowdsourcingApi',
        path: '/requester/tasks/batch',
        options: { body: payload }
      });

      await restOperation.response;
      alert('Batch creado exitosamente');
      setJsonInput('');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      alert('Error: JSON inválido o fallo en red');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (batchId: string) => {
    if(!batchId) return;
    try {
      setLoading(true);
      const restOperation = post({
        apiName: 'CrowdsourcingApi',
        path: `/requester/tasks/${batchId}/publish`
      });
      await restOperation.response;
      alert('Batch publicado. Los trabajadores ya pueden verlo.');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
      alert('Error al publicar');
    } finally {
      setLoading(false);
    }
  };

  // Agrupar tareas por Batch ID para visualización
  const batches = Object.values(tasks.reduce((acc: any, task) => {
    const bid = task.batchId || 'sin-batch';
    if (!acc[bid]) acc[bid] = { id: bid, tasks: [], status: task.status };
    acc[bid].tasks.push(task);
    return acc;
  }, {}));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Panel de Cliente (Requester)</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Columna Izquierda: Crear Tareas */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <Upload size={20} className="mr-2 text-blue-600" /> Crear Nuevo Lote
          </h3>

          <p className="text-sm text-gray-500 mb-2">Pega tu JSON de tareas aquí:</p>
          <textarea
            className="w-full h-64 p-3 border rounded-lg font-mono text-xs bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none mb-4"
            placeholder='[{"type": "image-label", "payload": {...}, "isGold": false}]'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />

          <button
            onClick={handleCreateBatch}
            disabled={loading || !jsonInput}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Subir Tareas'}
          </button>

          <div className="mt-4 text-xs text-gray-400 bg-gray-100 p-3 rounded">
            <strong>Tip:</strong> Usa <code>"isGold": true</code> y <code>"goldAnswer": "..."</code> para probar el control de calidad automático.
          </div>
        </div>

        {/* Columna Derecha: Mis Lotes */}
        <div className="lg:col-span-2">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <FileJson size={20} className="mr-2 text-green-600" /> Mis Lotes de Tareas
          </h3>

          {batches.length === 0 ? (
            <div className="text-center p-10 bg-gray-50 rounded-lg border border-dashed">
              No has creado ninguna tarea todavía.
            </div>
          ) : (
            <div className="space-y-4">
              {batches.map((batch: any) => (
                <div key={batch.id} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-gray-400">ID: {batch.id.split('-')[0]}...</span>
                      <h4 className="font-bold text-gray-800">Lote con {batch.tasks.length} tareas</h4>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${batch.tasks[0].status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          Estado: {batch.tasks[0].status}
                        </span>
                      </div>
                    </div>

                    {batch.tasks[0].status === 'Created' && (
                      <button
                        onClick={() => handlePublish(batch.id)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        <Play size={16} className="mr-2" /> Publicar
                      </button>
                    )}
                  </div>

                  {/* Mini stats */}
                  <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700">{batch.tasks.length}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center border-l">
                      <div className="text-2xl font-bold text-blue-600">
                        {batch.tasks.filter((t: any) => t.status === 'Assigned' || t.status === 'Review').length}
                      </div>
                      <div className="text-xs text-gray-500">En Progreso</div>
                    </div>
                    <div className="text-center border-l">
                      <div className="text-2xl font-bold text-green-600">
                        {batch.tasks.filter((t: any) => t.status === 'Completed').length}
                      </div>
                      <div className="text-xs text-gray-500">Completadas</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
