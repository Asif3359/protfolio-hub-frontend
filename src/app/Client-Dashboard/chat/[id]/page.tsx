'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Avatar, IconButton, CircularProgress, Alert, useTheme } from '@mui/material';
import { Send, MoreVert, ArrowBack, Group as GroupIcon } from '@mui/icons-material';
import io from 'socket.io-client';
import { useAuth } from '@/app/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  isOnline?: boolean;
  lastSeenAt?: string;
  profileImage?: string;
}

interface Message {
  _id: string;
  sender: User;
  content: string;
  messageType: 'text' | 'image' | 'file';
  read: boolean;
  readAt?: string;
  timestamp: string;
}

interface Chat {
  _id: string;
  participants: User[];
  messages: Message[];
  lastMessage: string;
  isGroupChat: boolean;
  groupName?: string;
  groupAdmin?: string;
  createdAt: string;
  updatedAt: string;
}

const DynamicChatPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  type ClientSocket = ReturnType<typeof io>;
  const [socket, setSocket] = useState<ClientSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://protfolio-hub-backend.onrender.com/api';
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || API_BASE_URL.replace('/api', '');
  const WS_PATH = process.env.NEXT_PUBLIC_WS_PATH || '/socket.io';

  const getCurrentUserId = () => user?.id || '';

  const formatMessageTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const shouldGroupMessage = (currentMessage: Message, previousMessage?: Message) => {
    if (!previousMessage) return false;
    return (
      currentMessage.sender?._id === previousMessage.sender?._id &&
      new Date(currentMessage.timestamp).getTime() - new Date(previousMessage.timestamp).getTime() < 5 * 60 * 1000
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewMessage = (data: { chatId: string; message: Message }) => {
    if (selectedChat?._id !== data.chatId) return;
    setMessages(prev => {
      const withoutTemp = prev.filter(m => !(m._id.startsWith('temp_') && m.content === data.message.content && m.sender._id === data.message.sender._id));
      const exists = withoutTemp.some(m => m._id === data.message._id);
      return exists ? withoutTemp.map(m => (m._id === data.message._id ? data.message : m)) : [...withoutTemp, data.message];
    });
  };

  const handleMessageSent = (data: { chatId: string; message: Message }) => {
    if (selectedChat?._id !== data.chatId) return;
    setMessages(prev => {
      const withoutTemp = prev.filter(m => !(m._id.startsWith('temp_') && m.content === data.message.content && m.sender._id === data.message.sender._id));
      const exists = withoutTemp.some(m => m._id === data.message._id);
      return exists ? withoutTemp.map(m => (m._id === data.message._id ? data.message : m)) : [...withoutTemp, data.message];
    });
  };

  const handleMessagesRead = (data: { chatId: string; readBy: string; readAt: string }) => {
    if (selectedChat?._id !== data.chatId) return;
    setMessages(prev => prev.map(msg => (!msg.read && msg.sender._id !== data.readBy ? { ...msg, read: true, readAt: data.readAt } : msg)));
  };

  const handleUserStatusChange = (data: { userId: string; isOnline: boolean; lastSeenAt: string }) => {
    setSelectedChat(prev =>
      prev
        ? {
            ...prev,
            participants: prev.participants.map(p => (p._id === data.userId ? { ...p, isOnline: data.isOnline, lastSeenAt: data.lastSeenAt } : p)),
          }
        : prev
    );
  };

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

    const socketInstance = io(WS_URL, {
      auth: { token },
      path: WS_PATH,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => setIsConnected(true));
    socketInstance.on('connect_error', () => setIsConnected(false));
    socketInstance.on('disconnect', () => setIsConnected(false));
    socketInstance.on('new_message', handleNewMessage);
    socketInstance.on('message_sent', handleMessageSent);
    socketInstance.on('messages_read', handleMessagesRead);
    socketInstance.on('user_status_change', handleUserStatusChange);
    socketInstance.on('user_typing', (data: { chatId: string; userId: string }) => {
      if (data.chatId === selectedChat?._id && data.userId !== getCurrentUserId()) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
      }
    });
    socketInstance.on('user_stopped_typing', (data: { chatId: string; userId: string }) => {
      if (data.chatId === selectedChat?._id) {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
      }
    });

    setSocket(socketInstance);
    return () => {
      socketInstance.removeAllListeners();
      socketInstance.close();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user, selectedChat?._id, WS_URL, WS_PATH]);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/chat`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (data.success) {
          const allChats = data.data as Chat[];
          const found = allChats.find((c: Chat) => c._id === params.id) || null;
          if (found) {
            setSelectedChat(found);
            setMessages(found.messages);
            await markMessagesAsRead(found._id);
          } else {
            setError('Chat not found');
          }
        } else {
          setError(data.message);
        }
      } catch {
        setError('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };
    if (user && params?.id) fetchChat();
  }, [user, params?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user || !params?.id || isConnected) return;
    const interval = setInterval(() => {
      // Poll for updates if socket disconnected
      void (async () => {
        try {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/chat`, { headers: { Authorization: `Bearer ${token}` } });
          const data = await response.json();
          if (data.success) {
            const allChats = data.data as Chat[];
            const found = allChats.find((c: Chat) => c._id === params.id);
            if (found) {
              setSelectedChat(found);
              setMessages(found.messages);
            }
          }
        } catch {
          // ignore
        }
      })();
    }, 3000);
    return () => clearInterval(interval);
  }, [user, params?.id, isConnected]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    const messageContent = newMessage.trim();
    setNewMessage('');

    const optimisticMessage: Message = {
      _id: `temp_${Date.now()}`,
      sender: { _id: getCurrentUserId(), name: user?.name || '', email: user?.email || '' },
      content: messageContent,
      messageType: 'text',
      read: false,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);

    if (socket && isConnected) {
      try {
        socket.emit('send_message', { chatId: selectedChat._id, content: messageContent, messageType: 'text' });
      } catch {
        await sendMessageViaAPI(messageContent);
      }
    } else {
      await sendMessageViaAPI(messageContent);
    }
  };

  const sendMessageViaAPI = async (messageContent: string) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chat/${selectedChat!._id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: messageContent, messageType: 'text' }),
      });
      const data = await response.json();
      if (data.success) {
        const realMessage: Message = data.data.message;
        setMessages(prev => prev.map(m => (m._id.startsWith('temp_') && m.content === messageContent ? realMessage : m)));
      } else {
        setMessages(prev => prev.filter(m => !(m._id.startsWith('temp_') && m.content === messageContent)));
        setError(data.message);
      }
    } catch {
      setMessages(prev => prev.filter(m => !(m._id.startsWith('temp_') && m.content === messageContent)));
      setError('Failed to send message');
    }
  };

  const markMessagesAsRead = async (chatId: string) => {
    try {
      if (socket && isConnected) {
        socket.emit('mark_as_read', { chatId });
      } else {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        await fetch(`${API_BASE_URL}/chat/${chatId}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      }
    } catch {
      // ignore
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const handleInputChange = (val: string) => {
    setNewMessage(val);
    if (!selectedChat) return;
    if (socket && isConnected) {
      try {
        socket.emit('typing_start', { chatId: selectedChat._id });
        if (typingStopTimeoutRef.current) clearTimeout(typingStopTimeoutRef.current);
        typingStopTimeoutRef.current = setTimeout(() => {
          socket.emit('typing_stop', { chatId: selectedChat._id });
        }, 1200);
      } catch {
        // ignore
      }
    }
  };

  const getChatDisplayName = (chat: Chat) => {
    if (chat.isGroupChat) return chat.groupName;
    const other = chat.participants.find(p => p._id !== getCurrentUserId());
    return other?.name || 'Unknown User';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.isGroupChat) return <GroupIcon />;
    const other = chat.participants.find(p => p._id !== getCurrentUserId());
    return other?.profileImage ? <Avatar src={other.profileImage} /> : <Avatar>{other?.name?.charAt(0) || 'U'}</Avatar>;
  };

  const typingNames = useMemo(
    () =>
      selectedChat && typingUsers.size > 0
        ? Array.from(typingUsers)
            .map(id => selectedChat.participants.find(p => p._id === id)?.name || 'User')
            .join(', ')
        : '',
    [selectedChat, typingUsers]
  );

  if (error && !selectedChat) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="90vh" flexDirection="column">
        <Typography variant="h6" color="error" gutterBottom>
          Error loading chat
        </Typography>
        <Button variant="contained" onClick={() => router.push('/Client-Dashboard/chat')}>Back to chats</Button>
      </Box>
    );
  }

  if (loading && !selectedChat) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="90vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box key="dynamic-chat" sx={{ height: '90vh', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 0, flex: 1 }}>
        {selectedChat && (
          <>
            {/* Header */}
            <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton onClick={() => router.push('/Client-Dashboard/chat')}>
                  <ArrowBack />
                </IconButton>
                {getChatAvatar(selectedChat)}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" noWrap>{getChatDisplayName(selectedChat)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedChat.isGroupChat
                      ? `${selectedChat.participants.length} members`
                      : selectedChat.participants.find(p => p._id !== getCurrentUserId())?.isOnline
                      ? 'Online'
                      : 'Offline'}
                  </Typography>
                </Box>
                <IconButton>
                  <MoreVert />
                </IconButton>
              </Box>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 1.25 }}>
              {messages.map((message, index) => {
                const isOwnMessage = message.sender?._id === getCurrentUserId();
                const prev = messages[index - 1];
                const isGrouped = shouldGroupMessage(message, prev);
                const showSenderName = !isOwnMessage && !isGrouped;
                return (
                  <Box key={`${message._id}-${message.timestamp}-${index}`} sx={{ display: 'flex', justifyContent: isOwnMessage ? 'flex-end' : 'flex-start', mb: isGrouped ? 0.5 : 2, mt: isGrouped ? 0 : 1 }}>
                    <Box sx={{
                      maxWidth: '85%',
                      backgroundColor: isOwnMessage ? theme.palette.primary.main : theme.palette.grey[100],
                      color: isOwnMessage ? theme.palette.primary.contrastText : theme.palette.text.primary,
                      borderRadius: isGrouped ? (isOwnMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px') : '18px',
                      p: 1.25,
                      position: 'relative',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {showSenderName && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block', fontWeight: 500 }}>
                          {message.sender?.name}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{message.content}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 0.5, gap: 0.5 }}>
                        <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>{formatMessageTime(message.timestamp)}</Typography>
                        {isOwnMessage && <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>{message.read ? '✓✓' : '✓'}</Typography>}
                      </Box>
                    </Box>
                  </Box>
                );
              })}

              {/* Typing */}
              {typingUsers.size > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Box sx={{ backgroundColor: theme.palette.grey[100], borderRadius: '18px 18px 18px 4px', p: 1.25 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {typingNames} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                    </Typography>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ p: 1.25, borderTop: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => handleInputChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, backgroundColor: theme.palette.grey[50], '&:hover': { backgroundColor: theme.palette.grey[100] }, '&.Mui-focused': { backgroundColor: theme.palette.background.paper } } }}
                />
                <Button variant="contained" color="primary" onClick={() => void sendMessage()} disabled={!newMessage.trim()} sx={{ minWidth: 'auto', px: 2, py: 1.25, borderRadius: 3 }}>
                  <Send />
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default DynamicChatPage;
