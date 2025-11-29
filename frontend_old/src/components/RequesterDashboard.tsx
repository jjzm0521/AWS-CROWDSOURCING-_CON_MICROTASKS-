import React, { useState, useEffect } from 'react';
import { get, post } from 'aws-amplify/api';
import { Upload, FileJson, Play, PlusCircle, Trash2, Image, Type, CheckSquare, Info } from 'lucide-react';

// Define la estructura de una tarea para mayor claridad
interface Task {
  type: string;
  payload: {
    imageUrl: string;
    instructions: string;
  };
  isGold: boolean;
  goldAnswer?: string;
}

export const RequesterDashboard: React.FC = () => {
  // Estado para lotes existentes y refresco de UI
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- Estado para el nuevo formulario ---
  const [currentBatchTasks, setCurrentBatchTasks] = useState<Task[]>([]);
  const [taskType, setTaskType] = useState('image-label');
  const [imageUrl, setImageUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isGold, setIsGold] = useState(false);
  const [goldAnswer, setGoldAnswer] = useState('');

  useEffect(() => {
    fetchMyBatches();
  }, [refreshTrigger]);

  const fetchMyBatches = async () => {
    try {
      const restOperation = get({ apiName: 'CrowdsourcingApi', path: '/requester/tasks' });
      const response = await restOperation.response;
      const data: any = await response.body.json();

      // Agrupar tareas por Batch ID para visualización
      const groupedBatches = Object.values((data.tasks || []).reduce((acc: any, task: any) => {
        const bid = task.batchId || 'sin-batch';
        if (!acc[bid]) acc[bid] = { id: bid, tasks: [], status: task.status, createdAt: task.createdAt };
        acc[bid].tasks.push(task);
        return acc;
      }, {}));

      // Ordenar lotes por fecha de creación
      groupedBatches.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setBatches(groupedBatches);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddTaskToBatch = () => {
    if (!imageUrl || !instructions) {
      alert('Por favor, completa la URL de la imagen y las instrucciones.');
      return;
    }
    if (isGold && !goldAnswer) {
      alert('Las tareas de control de calidad deben tener una respuesta correcta.');
      return;
    }

    const newTask: Task = {
      type: taskType,
      payload: { imageUrl, instructions },
      isGold,
      ...(isGold && { goldAnswer }),
    };

    setCurrentBatchTasks([...currentBatchTasks, newTask]);

    // Limpiar formulario
    setImageUrl('');
    setInstructions('');
    setIsGold(false);
    setGoldAnswer('');
  };

  const handleRemoveTask = (index: number) => {
    setCurrentBatchTasks(currentBatchTasks.filter((_, i) => i !== index));
  };

  const handleCreateBatch = async () => {
    if (currentBatchTasks.length === 0) {
      alert('Añade al menos una tarea al lote antes de crearlo.');
      return;
    }
    try {
      setLoading(true);
      const payload = { tasks: currentBatchTasks };

      const restOperation = post({
        apiName: 'CrowdsourcingApi',
        path: '/requester/tasks/batch',
        options: { body: payload as any }
      });

      await restOperation.response;
      alert('Lote creado exitosamente');
      setCurrentBatchTasks([]);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      alert('Error al crear el lote. Revisa la consola para más detalles.');
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
      alert('Lote publicado. Los trabajadores ya pueden verlo.');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
      alert('Error al publicar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Panel de Cliente</h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Columna Izquierda: Creador de Tareas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-fit">
          <h3 className="font-semibold text-xl mb-6 flex items-center text-gray-700">
            <PlusCircle size={24} className="mr-3 text-blue-600" /> Creador de Tareas
          </h3>

          {/* Formulario */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Tarea</label>
              <div className="flex items-center bg-gray-100 p-2 rounded-lg">
                <Type size={18} className="text-gray-500 mr-2" />
                <select value={taskType} onChange={(e) => setTaskType(e.target.value)} className="w-full bg-transparent outline-none text-gray-800">
                  <option value="image-label">Etiquetado de Imagen</option>
                  {/* Futuros tipos de tarea irían aquí */}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">URL de la Imagen</label>
              <div className="flex items-center bg-gray-100 p-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                <Image size={18} className="text-gray-500 mr-2" />
                <input type="text" placeholder="https://ejemplo.com/imagen.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full bg-transparent outline-none"/>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Instrucciones para el trabajador</label>
              <textarea
                className="w-full h-24 p-3 border rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: 'Etiqueta el objeto principal en la imagen.'"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
               <div className="flex items-center">
                <input type="checkbox" id="isGold" checked={isGold} onChange={(e) => setIsGold(e.target.checked)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"/>
                <label htmlFor="isGold" className="ml-2 text-sm font-medium text-blue-800">Es un Control de Calidad (Gold Standard)</label>
              </div>
              {isGold && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Respuesta Correcta</label>
                  <input type="text" placeholder="Ej: 'gato'" value={goldAnswer} onChange={(e) => setGoldAnswer(e.target.value)} className="w-full p-2 bg-white border rounded-lg"/>
                </div>
              )}
            </div>

            <button
              onClick={handleAddTaskToBatch}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 flex items-center justify-center">
              <PlusCircle size={18} className="mr-2"/> Añadir Tarea al Lote
            </button>
          </div>

          {/* Previsualización del Lote Actual */}
          <div className="mt-8">
            <h4 className="font-semibold text-lg mb-3">Lote Actual ({currentBatchTasks.length} Tareas)</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto bg-gray-50 p-3 rounded-lg border">
              {currentBatchTasks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Añade tareas para verlas aquí.</p>
              ) : (
                currentBatchTasks.map((task, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                    <p className="text-sm truncate text-gray-700">
                      <span className="font-semibold">{index + 1}:</span> {task.payload.instructions}
                      {task.isGold && <span className="text-xs ml-2 text-yellow-600">(GOLD)</span>}
                    </p>
                    <button onClick={() => handleRemoveTask(index)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={handleCreateBatch}
              disabled={loading || currentBatchTasks.length === 0}
              className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-bold disabled:opacity-50 flex items-center justify-center">
              <Upload size={18} className="mr-2"/> Crear Lote con {currentBatchTasks.length} Tareas
            </button>
          </div>

        </div>

        {/* Columna Derecha: Mis Lotes */}
        <div className="lg:col-span-3">
          <h3 className="font-semibold text-xl mb-6 flex items-center text-gray-700">
            <FileJson size={24} className="mr-3 text-green-600" /> Mis Lotes de Tareas
          </h3>

          {batches.length === 0 ? (
            <div className="text-center p-10 bg-white rounded-lg border-2 border-dashed">
              <p className="text-gray-500">No has creado ningún lote todavía.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {batches.map((batch: any) => (
                <div key={batch.id} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-gray-400">ID: {batch.id}</span>
                      <h4 className="font-bold text-gray-800 text-lg">Lote con {batch.tasks.length} tareas</h4>
                      <span className={`text-xs px-2 py-1 mt-2 inline-block rounded-full font-semibold ${batch.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {batch.status}
                      </span>
                    </div>

                    {batch.status === 'Created' && (
                      <button
                        onClick={() => handlePublish(batch.id)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition">
                        <Play size={16} className="mr-2" /> Publicar
                      </button>
                    )}
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
