import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Send, MessageCircle, Users, Clock, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: string;
  message: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatConversation {
  id: number;
  recruiterId: string;
  jobSeekerId: string;
  jobPostingId?: number;
  applicationId?: number;
  lastMessageAt: string;
  isActive: boolean;
  createdAt: string;
  jobTitle?: string;
  recruiterName?: string;
  jobSeekerName?: string;
  unreadCount?: number;
}

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  // Get conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/chat/conversations'],
  });

  // Get messages for selected conversation
  const { data: conversationMessages = [] } = useQuery({
    queryKey: ['/api/chat/conversations', selectedConversation, 'messages'],
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string }) => {
      return apiRequest('POST', `/api/chat/conversations/${selectedConversation}/messages`, { message: messageData.message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations', selectedConversation, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      setNewMessage('');
    },
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (conversationData: {
      jobSeekerId?: string;
      recruiterId?: string;
      jobPostingId?: number;
      applicationId?: number;
    }) => {
      return apiRequest('POST', '/api/chat/conversations', conversationData);
    },
    onSuccess: (response: any) => {
      setSelectedConversation(response.id);
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      return apiRequest('POST', `/api/chat/conversations/${conversationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
    },
  });

  // Update messages when conversation messages change
  useEffect(() => {
    if (conversationMessages && Array.isArray(conversationMessages)) {
      setMessages(conversationMessages);
    }
  }, [conversationMessages]);

  // Mark messages as read when selecting conversation
  useEffect(() => {
    if (selectedConversation && user?.id) {
      markAsReadMutation.mutate(selectedConversation);
    }
  }, [selectedConversation, user?.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || sendMessageMutation.isPending) {
      return;
    }

    sendMessageMutation.mutate({ message: newMessage });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const getUserDisplayName = (conversation: any) => {
    if (!user) return '';
    
    if (user.userType === 'recruiter') {
      return conversation.jobSeekerName || 'Job Seeker';
    } else {
      return conversation.recruiterName || 'Recruiter';
    }
  };

  const getConversationTitle = (conversation: any) => {
    const displayName = getUserDisplayName(conversation);
    const jobTitle = conversation.jobTitle ? ` - ${conversation.jobTitle}` : '';
    return `${displayName}${jobTitle}`;
  };

  if (conversationsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Messages</h1>
        <Badge variant="secondary" className="ml-2">
          {Array.isArray(conversations) ? conversations.length : 0} conversations
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-320px)]">
              {Array.isArray(conversations) && conversations.length > 0 ? (
                conversations.map((conversation: any) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedConversation === conversation.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {getConversationTitle(conversation)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatMessageTime(conversation.lastMessageAt)}
                          </span>
                        </div>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No conversations yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start a conversation by applying to jobs or posting positions
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  {Array.isArray(conversations) && conversations.find((c: any) => c.id === selectedConversation) && 
                    getConversationTitle(conversations.find((c: any) => c.id === selectedConversation))
                  }
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-[calc(100vh-380px)]">
                {/* Messages */}
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4 p-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.senderId === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs opacity-70">
                              {formatMessageTime(message.createdAt)}
                            </span>
                            {message.senderId === user?.id && message.isRead && (
                              <CheckCheck className="h-3 w-3 opacity-70" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the left to start messaging
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}