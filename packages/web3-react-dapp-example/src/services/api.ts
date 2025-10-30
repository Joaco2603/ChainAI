import axios from 'axios';
import { BACKEND_URL } from '../config/contract';
import {
  GenerationRequest,
  GenerationResponse,
  JobStatus,
  RatingRequest,
  RatingResponse,
  UploadModelRequest,
  UploadModelResponse,
  TopModelsResponse,
  Model,
} from '../types';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Model Management
  async getTopModels(limit: number = 10): Promise<TopModelsResponse> {
    const response = await api.get(`/models/top?limit=${limit}`);
    return response.data;
  },

  async getModel(modelId: number): Promise<Model> {
    const response = await api.get(`/models/${modelId}`);
    return response.data;
  },

  async uploadModel(data: UploadModelRequest): Promise<UploadModelResponse> {
    const response = await api.post('/models/upload-model', data);
    return response.data;
  },

  async rateModel(data: RatingRequest): Promise<RatingResponse> {
    const response = await api.post('/models/rate-model', data);
    return response.data;
  },

  // Generation
  async generateText(data: GenerationRequest): Promise<GenerationResponse> {
    const response = await api.post('/generate', data);
    return response.data;
  },

  async getJobStatus(jobId: string): Promise<JobStatus> {
    const response = await api.get(`/generate/job/${jobId}`);
    return response.data;
  },

  async getJobResult(jobId: string): Promise<any> {
    const response = await api.get(`/generate/result/${jobId}`);
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<any> {
    const response = await api.get('/health');
    return response.data;
  },
};
