// Type definitions for the application

export interface Model {
  model_id: number;
  owner: string;
  docker_image_url: string;
  average_rating: number;
  rating_count: number;
  times_selected: number;
  is_active: boolean;
}

export interface GenerationRequest {
  prompt: string;
  timeout?: number;
}

export interface GenerationResponse {
  success: boolean;
  job_id: string;
  message: string;
}

export interface JobStatus {
  job_id: string;
  job_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: {
    model_id: number;
    output: string;
    transaction_hash?: string;
  };
  error?: string;
  created_at: string;
  completed_at?: string;
}

export interface RatingRequest {
  model_id: number;
  rating: number;
}

export interface RatingResponse {
  success: boolean;
  model_id: number;
  rating: number;
  transaction_hash: string;
  block_number: number;
  message: string;
}

export interface UploadModelRequest {
  docker_image_url: string;
}

export interface UploadModelResponse {
  success: boolean;
  model_id: number;
  transaction_hash: string;
  block_number: number;
  message: string;
}

export interface TopModelsResponse {
  success: boolean;
  models: Model[];
  count: number;
}
