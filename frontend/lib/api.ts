// lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Assessment {
  assessment_name: string;
  assessment_url: string;
  relevance_score: number;
  test_type?: string;
  description?: string;
}

export interface RecommendationResponse {
  query: string;
  recommendations: Assessment[];
  count: number;
}

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const recommendApi = {
  health: async () => {
    const response = await client.get('/health');
    return response.data;
  },

  recommend: async (query: string, topK: number = 10) => {
    const response = await client.post<RecommendationResponse>('/recommend', {
      query,
      top_k: topK,
    });
    return response.data;
  },
};
