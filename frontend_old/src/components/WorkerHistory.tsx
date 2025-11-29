import React, { useEffect, useState } from 'react';
import { get, post } from 'aws-amplify/api';
import { AlertCircle, CheckCircle, XCircle, Gavel, RefreshCw } from 'lucide-react';

export const WorkerHistory: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [disputeReason, setDisputeReason] = useState('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Nota: Asumimos que existe un endpoint o GSI para listar submissions del worker.
      // Si no existe específico, filtraremos en cliente por simplicidad del MVP
      // o usaremos el endpoint de 'tasks' si enriquecimos la data.
      // Para este MVP, usaremos un endpoint simulado o reusaremos lógica si existe.
      // *Idealmente: GET /worker/submissions*

      // Workaround MVP: Usamos las tareas y asumimos que el backend nos devuelve
      // el estado de nuestras asignaciones/sumisiones si existen.
      // O mejor, simulamos data si el endpoint GET /worker/submissions no fue creado explícitamente en el stack anterior.
      // Revisando backend-stack, no vi GET /worker/submissions explícito.
      // Vamos a asumir que se agregó o usar el placeholder.

      // Ajuste Realista: Como no creamos GET /worker/submissions en el paso anterior,
      // te daré el código asumiendo que lo agregarás, o mostraré un mensaje.
      // PERO, para que funcione YA, vamos a simular la llamada a tasks y filtrar localmente si tuviera info,
      // o fallar amablemente.

      // *Corrección*: Si no tienes el endpoint GET /worker/submissions en tu backend-stack,
      // este fetch fallará. Para cerrar el proyecto, usa este código pero recuerda agregar el endpoint
      // o usa tasks disponibles como proxy visual.

      // Vamos a intentar llamar a un endpoint genérico de listado si existe, sino mock data para visualización.
       const restOperation = get({ apiName: 'CrowdsourcingApi', path: '/worker/tasks?history=true' });
       // Nota: Esto requiere soporte en el backend.

       // MOCK DATA PARA VISUALIZACIÓN (Eliminar al integrar backend real de historial)
       setSubmissions([
         { submissionId: '1', taskId: 'tarea-foto-gato', status: 'Approved', reward: 0.5, createdAt: '2023-10-27' },
         { submissionId: '2', taskId: 'tarea-audio-ruido', status: 'Rejected', reward: 0.5, createdAt: '2023-10-28' },
         { submissionId: '3', taskId: 'tarea-texto-mal', status: 'Disputed', reward: 0.5, createdAt: '2023-10-29' },
       ]);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDispute = (subId: string) => {
    setSelectedSubmissionId(subId);
    setDisputeReason('');
  };

  const submitDispute = async () => {
    if (!selectedSubmissionId || !disputeReason) return;

    try {
      const restOperation = post({
        apiName: 'CrowdsourcingApi',
        path: '/worker/disputes',
        options: {
          body: {
            submissionId: selectedSubmissionId,
            reason: disputeReason
          }
        }
      });
      await restOperation.response;
      alert('Disputa enviada al tribunal.');
      setSelectedSubmissionId(null);
      // Recargar data real aquí
    } catch (e) {
      console.error(e);
      alert('Error al enviar disputa');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <RefreshCw className="mr-2 cursor-pointer hover:rotate-180 transition" onClick={fetchHistory} size={24}/>
        Historial de Trabajo
      </h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarea</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((sub) => (
              <tr key={sub.submissionId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.taskId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.createdAt}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${sub.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      sub.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {sub.status === 'Approved' && <CheckCircle size={14} className="mr-1 inline"/>}
                    {sub.status === 'Rejected' && <XCircle size={14} className="mr-1 inline"/>}
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sub.status === 'Rejected' && (
                    <button
                      onClick={() => handleOpenDispute(sub.submissionId)}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center"
                    >
                      <Gavel size={16} className="mr-1"/> Apelar
                    </button>
                  )}
                  {sub.status === 'Disputed' && <span className="text-gray-400 italic">En revisión</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Disputa Simple */}
      {selectedSubmissionId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Iniciar Disputa</h3>
            <p className="text-sm text-gray-600 mb-4">Explica por qué crees que tu trabajo fue rechazado incorrectamente.</p>
            <textarea
              className="w-full border rounded p-2 mb-4 h-32"
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              placeholder="Tu explicación..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedSubmissionId(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={submitDispute}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Enviar Apelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
