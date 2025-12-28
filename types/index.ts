export type WorkflowStage = 'idle' | 'issued' | 'production' | 'alteration' | 'qc' | 'packing' | 'completed';

export interface Worker {
  id: string;
  name: string;
  role: string;
  created_at: string;
}

export interface DailyProduction {
  id: string;
  worker_id: string;
  date: string; // YYYY-MM-DD
  
  goods_issued: number;
  goods_produced: number;
  goods_in_hand: number; // Calculated
  
  alteration_count: number;
  qc_passed: number;
  qc_failed: number;
  packing_completed: number;
  
  current_stage: WorkflowStage;
  updated_at: string;
  
  // Join fields
  worker?: Worker;
}

export interface ProductionLog {
  id: string;
  production_id: string;
  stage: WorkflowStage;
  action: string; // e.g., "Issued 50", "produced 20"
  quantity: number;
  timestamp: string;
}
