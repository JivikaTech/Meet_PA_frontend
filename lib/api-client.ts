import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  UploadResponse,
  TranscribeResponse,
  SummaryResponse,
  EnhancedSummaryResponse,
  EnhancedSummarizeRequest,
  ProcessingEstimate,
  MeetingType,
  ChatResponsePayload,
  MeetingListItem,
  AnalyticsOverview,
  IngestMeetingResponse,
  ChatSession,
  CreateChatSessionRequest,
  UpdateChatSessionRequest,
  AddMessageRequest,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;
  private auth: { token?: string; workspaceId?: string } = {};

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
        // Preserve existing headers (important for FormData)
        if (!config.headers) {
          config.headers = {} as any;
        }
        
        if (this.auth.token) {
          config.headers['Authorization'] = `Bearer ${this.auth.token}`;
        }
        if (this.auth.workspaceId) {
          config.headers['X-Workspace-Id'] = this.auth.workspaceId;
        }
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
          const message = (error.response.data as Record<string, unknown>)?.message as string || error.message;
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

  setAuth(auth: { token?: string; workspaceId?: string }) {
    this.auth = auth;
  }

  private resolveTenant(tenantId?: string) {
    return tenantId || this.auth.workspaceId;
  }

  async uploadAudio(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('audio', file);

    const response = await this.client.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Preserve FormData; don't let axios stringify
      transformRequest: (data) => data,
    });

    return response.data.data;
  }

  async transcribeAudio(meetingId: string, s3Path: string): Promise<TranscribeResponse> {
    const response = await this.client.post('/api/transcribe', {
      meetingId,
      s3Path,
    });

    return response.data.data;
  }

  /**
   * Legacy: Generate simple flat summary
   */
  async generateSummary(transcript: string): Promise<SummaryResponse> {
    const response = await this.client.post('/api/summarize', {
      transcript,
    });

    return response.data.data;
  }

  /**
   * Enhanced: Generate hierarchical meeting structure
   */
  async generateEnhancedSummary(
    transcript: string,
    metadata?: {
      participants?: string[];
      duration?: string;
      type?: MeetingType;
      date?: string;
    }
  ): Promise<EnhancedSummaryResponse> {
    const request: EnhancedSummarizeRequest = {
      transcript,
      meetingMetadata: metadata,
    };

    const response = await this.client.post('/api/summarize/v2', request);

    return response.data.data;
  }

  /**
   * Get estimated processing time for a transcript
   */
  async estimateProcessingTime(transcript: string): Promise<ProcessingEstimate> {
    const response = await this.client.post('/api/summarize/estimate', {
      transcript,
    });

    return response.data.data;
  }

  /**
   * Validate transcript before processing
   */
  async validateTranscript(transcript: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await this.client.post('/api/summarize/validate', {
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

  async ingestMeeting(params: {
    transcript: string;
    tenantId?: string;
    meetingId?: string;
    metadata?: {
      title?: string;
      participants?: string[];
      duration?: string;
      type?: MeetingType;
      date?: string;
    };
  }): Promise<IngestMeetingResponse> {
    const response = await this.client.post('/api/meetings/ingest', {
      ...params,
      tenantId: this.resolveTenant(params.tenantId),
    });
    return response.data.data;
  }

  async listMeetings(tenantId?: string): Promise<MeetingListItem[]> {
    const resolvedTenant = this.resolveTenant(tenantId);
    const response = await this.client.get('/api/meetings', {
      params: resolvedTenant ? { tenantId: resolvedTenant } : undefined,
    });
    return response.data.data;
  }

  async getMeeting(meetingId: string, tenantId?: string): Promise<unknown> {
    const resolvedTenant = this.resolveTenant(tenantId);
    const response = await this.client.get(`/api/meetings/${meetingId}`, {
      params: resolvedTenant ? { tenantId: resolvedTenant } : undefined,
    });
    return response.data.data;
  }

  async askChat(params: {
    question: string;
    meetingId?: string;
    tenantId?: string;
    limit?: number;
  }): Promise<ChatResponsePayload> {
    const response = await this.client.post('/api/chat', {
      ...params,
      tenantId: this.resolveTenant(params.tenantId),
    });
    return response.data.data;
  }

  async getAnalyticsOverview(tenantId?: string): Promise<AnalyticsOverview> {
    const resolvedTenant = this.resolveTenant(tenantId);
    const response = await this.client.get('/api/analytics/overview', {
      params: resolvedTenant ? { tenantId: resolvedTenant } : undefined,
    });
    return response.data.data;
  }

  // ==========================================
  // Chat History Methods
  // ==========================================

  async createChatSession(params: CreateChatSessionRequest): Promise<ChatSession> {
    const response = await this.client.post('/api/chat/sessions', params);
    return response.data.data;
  }

  async getChatSession(sessionId: string): Promise<ChatSession> {
    const response = await this.client.get(`/api/chat/sessions/${sessionId}`);
    return response.data.data;
  }

  async listChatSessions(limit?: number): Promise<ChatSession[]> {
    const response = await this.client.get('/api/chat/sessions', {
      params: limit ? { limit: limit.toString() } : undefined,
    });
    return response.data.data;
  }

  async addMessageToSession(sessionId: string, params: AddMessageRequest): Promise<ChatSession> {
    const response = await this.client.post(
      `/api/chat/sessions/${sessionId}/messages`,
      params
    );
    return response.data.data;
  }

  async updateChatSession(sessionId: string, params: UpdateChatSessionRequest): Promise<ChatSession> {
    const response = await this.client.patch(`/api/chat/sessions/${sessionId}`, params);
    return response.data.data;
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    await this.client.delete(`/api/chat/sessions/${sessionId}`);
  }
}

export const apiClient = new ApiClient();
