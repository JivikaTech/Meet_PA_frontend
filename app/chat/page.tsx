'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import {
  ChatResponsePayload,
  MeetingListItem,
  AnalyticsOverview,
  ChatSession,
  ChatMessage,
} from '@/lib/types';
import { Toaster, toast } from 'sonner';
import { useSession } from 'next-auth/react';
import {
  MessageCircle,
  BarChart3,
  Search,
  Loader2,
  Clock,
  Mic,
  Sparkles,
  PlayCircle,
  FileText,
  PlusCircle,
  Folder,
  Edit3,
  Settings,
  ChevronDown,
  Paperclip,
  Send,
  User,
  Bot,
  Trash2,
} from 'lucide-react';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const accessToken = (session as Record<string, unknown> | null)?.accessToken as string | undefined;
  const defaultWorkspaceId = (session?.user as { workspaceId?: string } | undefined)?.workspaceId;
  const workspaces = (session?.user as { workspaces?: Array<{ workspaceId: string; workspaceName: string }> } | undefined)
    ?.workspaces || [];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<string | undefined>();
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | undefined>(defaultWorkspaceId);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const tenantId = activeWorkspaceId || defaultWorkspaceId || process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'default';

  useEffect(() => {
    setActiveWorkspaceId(defaultWorkspaceId);
  }, [defaultWorkspaceId]);

  useEffect(() => {
    if (accessToken) {
      apiClient.setAuth({ token: accessToken, workspaceId: tenantId });
    }
  }, [accessToken, tenantId]);

  useEffect(() => {
    const load = async () => {
      if (status !== 'authenticated' || !accessToken) return;
      try {
        setLoadingSessions(true);
        const [meetingList, overview, sessions] = await Promise.all([
          apiClient.listMeetings(tenantId),
          apiClient.getAnalyticsOverview(tenantId),
          apiClient.listChatSessions(50),
        ]);
        setMeetings(meetingList);
        setAnalytics(overview);
        setChatSessions(sessions);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setLoadingSessions(false);
      }
    };
    if (tenantId) {
      load();
    }
  }, [tenantId, status, accessToken]);

  useEffect(() => {
    setSelectedMeeting(undefined);
    setMessages([]);
    setCurrentSessionId('');
  }, [tenantId]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    const now = new Date().toISOString();
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question.trim(),
      timestamp: now,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setQuestion('');

    try {
      const response = await apiClient.askChat({
        question: userMessage.content,
        meetingId: selectedMeeting,
        tenantId,
      });

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
        sources: response.sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Create or update chat session
      if (messages.length === 0 && !currentSessionId) {
        // First message - create new session
        const session = await apiClient.createChatSession({
          title: userMessage.content.slice(0, 50),
          meetingId: selectedMeeting,
          firstMessage: userMessage,
        });
        setCurrentSessionId(session.sessionId);
        
        // Add assistant message to session
        await apiClient.addMessageToSession(session.sessionId, {
          message: assistantMessage,
        });
        
        // Update local sessions list
        setChatSessions((prev) => [session, ...prev]);
      } else if (currentSessionId) {
        // Add messages to existing session
        await apiClient.addMessageToSession(currentSessionId, {
          message: userMessage,
        });
        await apiClient.addMessageToSession(currentSessionId, {
          message: assistantMessage,
        });
        
        // Update session in local state
        setChatSessions((prev) =>
          prev.map((s) =>
            s.sessionId === currentSessionId
              ? { ...s, lastMessageAt: assistantMessage.timestamp }
              : s
          )
        );
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId('');
    setQuestion('');
  };

  const handleLoadSession = async (sessionId: string) => {
    try {
      const session = await apiClient.getChatSession(sessionId);
      setMessages(session.messages);
      setCurrentSessionId(session.sessionId);
      if (session.meetingId) {
        setSelectedMeeting(session.meetingId);
      }
    } catch (error) {
      toast.error('Failed to load chat session');
    }
  };

  const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await apiClient.deleteChatSession(sessionId);
      setChatSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
      toast.success('Chat deleted successfully');
    } catch (error) {
      toast.error('Failed to delete chat session');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
  };

  const meetingOptions = useMemo(
    () =>
      meetings.map((m) => ({
        value: m.meetingId,
        label: m.title || m.meetingId,
      })),
    [meetings]
  );

  const selectedMeetingLabel = useMemo(
    () => meetingOptions.find((opt) => opt.value === selectedMeeting)?.label || 'All meetings',
    [meetingOptions, selectedMeeting]
  );

  const suggestions = [
    'What were the key decisions made in recent meetings?',
    'Show me all action items assigned to team members',
    'Summarize discussions about project deadlines',
    'What topics were discussed most frequently?',
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-gray-200">
        <p className="text-sm text-gray-400">Loading your workspace...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-gray-200">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-10 text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-semibold">Sign in to chat</h1>
          <p className="text-gray-400 text-sm">
            Connect your account to query your meetings and analytics.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-lg border border-gray-700 text-gray-200 text-sm font-semibold hover:bg-[#252525] transition"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-gray-100 overflow-hidden">
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <aside className="w-72 bg-[#0f0f0f] border-r border-gray-800 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] transition text-sm font-medium"
          >
            <PlusCircle className="w-5 h-5" />
            New Chat
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 dark-scrollbar">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200 transition text-sm"
          >
            <Folder className="w-5 h-5" />
            Meetings
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200 transition text-sm"
          >
            <Edit3 className="w-5 h-5" />
            Prompts
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200 transition text-sm"
          >
            <FileText className="w-5 h-5" />
            Documents
          </Link>

          {/* Chat History */}
          {loadingSessions ? (
            <div className="pt-4 mt-4 border-t border-gray-800 px-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading chats...
              </div>
            </div>
          ) : chatSessions.length > 0 ? (
            <div className="pt-4 mt-4 border-t border-gray-800">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase mb-2">Recent Chats</h3>
              <div className="space-y-1">
                {chatSessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                      session.sessionId === currentSessionId
                        ? 'bg-[#1a1a1a] text-gray-200'
                        : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => handleLoadSession(session.sessionId)}
                      className="flex-1 text-left truncate"
                    >
                      {session.title}
                    </button>
                    <button
                      onClick={(e) => handleDeleteSession(session.sessionId, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </nav>

        {/* Search */}
        <div className="p-4 border-t border-gray-800">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200 transition text-sm">
            <Search className="w-5 h-5" />
            Search
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 px-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="text-lg font-semibold">Meet PA</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] transition text-sm">
                <span className="text-gray-400">
                  {workspaces.find((w) => w.workspaceId === tenantId)?.workspaceName || 'Workspace'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              <select
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={tenantId}
                onChange={(e) => setActiveWorkspaceId(e.target.value || undefined)}
              >
                {workspaces.map((ws) => (
                  <option key={ws.workspaceId} value={ws.workspaceId}>
                    {ws.workspaceName}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] transition text-sm">
                <span className="text-gray-400">Select a meeting</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              <select
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={selectedMeeting || ''}
                onChange={(e) => setSelectedMeeting(e.target.value || undefined)}
              >
                <option value="">All meetings</option>
                {meetingOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            
            <Link href="/" className="text-gray-400 hover:text-gray-200 text-sm">
              Back to Summaries
            </Link>
            
            <button className="p-2 rounded-lg hover:bg-[#1a1a1a] transition">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto dark-scrollbar">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex flex-col items-center justify-center h-full px-6 py-12">
              <div className="w-16 h-16 mb-8 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-4xl font-semibold mb-4">How can I help you today?</h1>
              
              <div className="grid grid-cols-2 gap-3 mt-8 max-w-3xl w-full">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-4 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] border border-gray-800 transition text-left"
                  >
                    <p className="text-sm text-gray-300">{suggestion}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.role === 'user' 
                        ? 'bg-blue-600' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {msg.role === 'user' ? 'You' : 'Assistant'}
                      </span>
                      <span className="text-xs text-gray-500">{selectedMeetingLabel}</span>
                    </div>
                    
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="text-xs font-semibold text-gray-400 flex items-center gap-2">
                          <BarChart3 className="w-3.5 h-3.5" />
                          Sources
                        </div>
                        <div className="space-y-2">
                          {msg.sources.map((src, idx) => (
                            <div
                              key={`${src.meetingId}-${src.chunkId}-${idx}`}
                              className="border border-gray-800 rounded-lg p-3 bg-[#1a1a1a] text-xs"
                            >
                              <p className="font-medium text-gray-300 mb-1">
                                [{idx + 1}] Meeting {src.meetingId} • Score {src.score.toFixed(2)}
                              </p>
                              <p className="line-clamp-3 text-gray-400">{src.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3 p-3 rounded-2xl bg-[#1a1a1a] border border-gray-800">
              <button className="p-2 hover:bg-[#252525] rounded-lg transition">
                <Paperclip className="w-5 h-5 text-gray-400" />
              </button>
              
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                placeholder="Send a message"
                rows={1}
                className="flex-1 bg-transparent outline-none resize-none text-gray-200 placeholder-gray-500"
              />
              
              <button className="p-2 hover:bg-[#252525] rounded-lg transition">
                <Mic className="w-5 h-5 text-gray-400" />
              </button>
              
              <button
                onClick={handleAsk}
                disabled={isLoading || !question.trim()}
                className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <p className="text-xs text-center text-gray-500 mt-3">
              LLMs can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

