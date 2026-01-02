export interface UploadResponse {
  meetingId: string;
  s3Path: string;
  s3Uri: string;
}

export interface TranscribeResponse {
  transcript: string;
  meetingId: string;
}

// Legacy summary response
export interface SummaryResponse {
  tldr: string;
  key_points: string[];
  decisions: string[];
  action_items: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type ProcessingStep = 'idle' | 'uploading' | 'transcribing' | 'summarizing' | 'complete' | 'error';

// ==========================================
// NEW: Hierarchical Meeting Structure Types
// ==========================================

/**
 * Meeting types for context-aware summarization
 */
export type MeetingType = 
  | 'interview'
  | 'standup'
  | 'planning'
  | 'review'
  | 'customer_call'
  | 'brainstorm'
  | 'general'
  | 'one_on_one';

/**
 * Processing strategy based on transcript length
 */
export type ProcessingStrategy = 'direct' | 'hierarchical' | 'map_reduce';

/**
 * Action item with optional owner
 */
export interface ActionItem {
  task: string;
  owner?: string;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Section metadata
 */
export interface SectionMetadata {
  speakers: string[];
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
  importance: 'high' | 'medium' | 'low';
}

/**
 * Participant information
 */
export interface Participant {
  name: string;
  role?: string;
  organization?: string;
}

/**
 * Meeting context section
 */
export interface MeetingContext {
  purpose: string;
  participants: Participant[];
  background: string;
  date?: string;
  duration?: string;
}

/**
 * Meeting-level metadata
 */
export interface MeetingMetadata {
  meetingType: MeetingType;
  totalDuration: string;
  processingStrategy: ProcessingStrategy;
  generatedAt: string;
  modelUsed: string;
  totalSections: number;
  totalActionItems: number;
  totalDecisions: number;
}

/**
 * Hierarchical section structure (recursive)
 */
export interface Section {
  id: string;
  heading: string;
  level: 2 | 3 | 4;
  content: string;
  subsections?: Section[];
  metadata: SectionMetadata;
}

/**
 * Complete hierarchical meeting structure
 */
export interface MeetingStructure {
  title: string;
  context: MeetingContext;
  sections: Section[];
  metadata: MeetingMetadata;
  legacy?: SummaryResponse;
}

/**
 * Transcript analysis result
 */
export interface TranscriptAnalysis {
  wordCount: number;
  estimatedDurationMinutes: number;
  speakerCount: number;
  speakers: string[];
  meetingType: MeetingType;
  strategy: ProcessingStrategy;
  complexity: 'low' | 'medium' | 'high';
  topicIndicators: string[];
  language: string;
}

/**
 * Enhanced summary response
 */
export interface EnhancedSummaryResponse {
  structure: MeetingStructure;
  analysis: TranscriptAnalysis;
  processingTime: number;
}

/**
 * Request for enhanced summarization
 */
export interface EnhancedSummarizeRequest {
  transcript: string;
  meetingMetadata?: {
    participants?: string[];
    duration?: string;
    type?: MeetingType;
    date?: string;
  };
}

/**
 * Processing estimate response
 */
export interface ProcessingEstimate {
  strategy: string;
  estimatedSeconds: number;
  estimatedDuration: string;
}

export interface MeetingListItem {
  meetingId: string;
  title?: string;
  meetingType: MeetingType;
  createdAt: string;
  durationMinutes?: number;
  speakerCount?: number;
  wordCount?: number;
}

export interface ChatSource {
  meetingId: string;
  chunkId: string;
  content: string;
  score: number;
  meetingType?: MeetingType;
}

export interface ChatResponsePayload {
  answer: string;
  sources: ChatSource[];
}

export interface IngestMeetingResponse extends EnhancedSummaryResponse {
  meetingId: string;
}

export interface AnalyticsOverview {
  totalMeetings: number;
  totalDurationMinutes: number;
  averageDurationMinutes: number;
  averageWordCount: number;
  meetingTypes: Record<string, number>;
  recentMeetings: MeetingListItem[];
}

export interface WorkspaceMembership {
  workspaceId: string;
  workspaceName: string;
  role: 'owner' | 'member';
  createdAt: string;
  createdBy?: string;
}

export interface AuthResponsePayload {
  token: string;
  user: {
    userId: string;
    email: string;
    workspaceId: string;
  };
  workspaces: WorkspaceMembership[];
}

// ==========================================
// Chat History Types
// ==========================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Array<{
    meetingId: string;
    chunkId: string;
    content: string;
    score: number;
  }>;
}

export interface ChatSession {
  sessionId: string;
  tenantId: string;
  userId?: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  meetingId?: string;
  isDeleted?: boolean;
}

export interface CreateChatSessionRequest {
  title: string;
  meetingId?: string;
  firstMessage?: ChatMessage;
}

export interface UpdateChatSessionRequest {
  title?: string;
  messages?: ChatMessage[];
}

export interface AddMessageRequest {
  message: ChatMessage;
}
