export interface Task {
  taskId: string;
  requesterId: string;
  batchId: string;
  status: 'Created' | 'Published' | 'Completed';
  type: string;
  payload: any;
  createdAt: string;
  isGold: boolean;
  reward?: number; // Added to payload or separate field in updated logic
}

export interface TaskInput {
  type: string;
  payload: any;
  isGold?: boolean;
  goldAnswer?: string;
  reward?: number;
}
