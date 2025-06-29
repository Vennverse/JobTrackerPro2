import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useWebSocket } from '@/hooks/useWebSocket';
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

  // WebSocket connection
  const { isConnected, sendMessage: sendWebSocketMessage } = useWebSocket({
    url: '/ws',
    userId: user?.id,
    onMessage: (message) => {
      if (message.type === 'newMessage') {
        // Add new message to current conversation
        if (message.conversationId === selectedConversation) {
          setMessages(prev => [...prev, message.message]);
        }
        // Refresh conversations list to update unread counts
        queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      }
      if (message.type === 'messageSent') {
        // Message sent successfully, add to local state
        if (message.conversationId === selectedConversation) {
          setMessages(prev => [...prev, message.message]);
        }
      }
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: number; message: string }) => {
      return apiRequest(`/api/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: { message }
      });
    },
    onSuccess: () => {
      setNewMessage('');
      // Refresh messages and conversations
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations', selectedConversation, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
    }
  });

  // Create new conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (data: { jobSeekerId?: string; recruiterId?: string; jobPostingId?: number; applicationId?: number }) => {
      return apiRequest('/api/chat/conversations', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      setSelectedConversation(newConversation.id);
    }
  });

  // Update messages when conversation changes
  useEffect(() => {
    if (conversationMessages) {
      setMessages(conversationMessages);
    }
  }, [conversationMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && user?.id) {
      // Join conversation via WebSocket
      sendWebSocketMessage({
        type: 'joinConversation',
        conversationId: selectedConversation
      });

      // Mark as read via API
      apiRequest(`/api/chat/conversations/${selectedConversation}/read`, {
        method: 'POST'
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      });
    }
  }, [selectedConversation, user?.id, sendWebSocketMessage, queryClient]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // Send via WebSocket for real-time delivery
    const sent = sendWebSocketMessage({
      type: 'sendMessage',
      conversationId: selectedConversation,
      messageText: newMessage.trim()
    });

    if (!sent) {
      // Fallback to API if WebSocket not connected
      sendMessageMutation.mutate({
        conversationId: selectedConversation,
        message: newMessage.trim()
      });
    } else {
      setNewMessage('');
    }
  };

  const getOtherParticipantName = (conversation: ChatConversation) => {
    if (user?.userType === 'recruiter') {
      return conversation.jobSeekerName || 'Job Seeker';
    } else {
      return conversation.recruiterName || 'Recruiter';
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-2">
          Communicate with {user?.userType === 'recruiter' ? 'job seekers' : 'recruiters'} about opportunities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Conversations
              {!isConnected && (
                <Badge variant="secondary" className="text-xs">
                  Offline
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {conversationsLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a conversation from a job application</p>
                </div>
              ) : (
                conversations.map((conversation: ChatConversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedConversation === conversation.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {getUserInitials(getOtherParticipantName(conversation))}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">
                            {getOtherParticipantName(conversation)}
                          </h4>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {conversation.jobTitle && (
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.jobTitle}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {conversations.find((c: ChatConversation) => c.id === selectedConversation)?.jobTitle || 'Conversation'}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-xs text-muted-foreground">
                      {isConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0 flex flex-col h-[600px]">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.senderId === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-xs opacity-70">
                              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                            </span>
                            {message.senderId === user?.id && message.isRead && (
                              <CheckCheck className="w-3 h-3 opacity-70" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p>Choose a conversation from the list to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}