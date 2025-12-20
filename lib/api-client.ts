import axios, { AxiosError, AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 300000, // 5 minutes for long transcription
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error: AxiosError) => {
        console.error('API Error:', error.message);

        if (error.response) {
          // Server responded with error
          const message = (error.response.data as any)?.message || error.message;
          throw new Error(message);
        } else if (error.request) {
          // Request made but no response
          throw new Error('No response from server. Please check if the backend is running.');
        } else {
          // Something else happened
          throw new Error(error.message);
        }
      }
    );
  }

  async uploadAudio(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('audio', file);

    const response = await this.client.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }

  async transcribeAudio(meetingId: string, s3Path: string): Promise<any> {
    const response = await this.client.post('/api/transcribe', {
      meetingId,
      s3Path,
    });

    return response.data.data;
  }

  async generateSummary(transcript: string): Promise<any> {
    const response = await this.client.post('/api/summarize', {
      transcript,
    });

    return response.data.data;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
