'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Badge,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  InputAdornment,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Send,
  Chat as ChatIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  MoreVert,
  Search,
  Add,
  Close,
  ArrowBack,
} from '@mui/icons-material';
// import { io, Socket } from 'socket.io-client';
// was
// import { io, Socket } from 'socket.io-client';

// fix
import io from 'socket.io-client';
// import type { Socket } from 'socket.io-client';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

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

interface UnreadCount {
  totalUnread: number;
  unreadByChat: Record<string, number>;
}

const ChatPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const router = useRouter();


  // State management
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  type ClientSocket = ReturnType<typeof io>;    
  const [socket, setSocket] = useState<ClientSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<UnreadCount>({ totalUnread: 0, unreadByChat: {} });
  // Track typing by userId for reliable start/stop pairing
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // UI State
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [newChatType, setNewChatType] = useState<'direct' | 'group'>('direct');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://protfolio-hub-backend.onrender.com/api';
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || API_BASE_URL.replace('/api', '');
  const WS_PATH = process.env.NEXT_PUBLIC_WS_PATH || '/socket.io';

  // State to store profile images for participants
  const [participantProfiles, setParticipantProfiles] = useState<Record<string, { profileImage?: string }>>({});

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
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat._id !== data.chatId) return chat;
        // Remove any local optimistic temp message that represents this real message
        const messagesWithoutTemp = chat.messages.filter(m =>
          !(m._id.startsWith('temp_') && m.content === data.message.content && m.sender._id === data.message.sender._id)
        );
        const exists = messagesWithoutTemp.some(m => m._id === data.message._id);
        const nextMessages = exists
          ? messagesWithoutTemp.map(m => (m._id === data.message._id ? data.message : m))
          : [...messagesWithoutTemp, data.message];
        return { ...chat, messages: nextMessages, lastMessage: data.message.timestamp };
      })
    );
    if (selectedChat?._id === data.chatId) {
      setMessages(prev => {
        const withoutTemp = prev.filter(m => !(m._id.startsWith('temp_') && m.content === data.message.content && m.sender._id === data.message.sender._id));
        const exists = withoutTemp.some(m => m._id === data.message._id);
        return exists ? withoutTemp.map(m => (m._id === data.message._id ? data.message : m)) : [...withoutTemp, data.message];
      });
      markMessagesAsRead(data.chatId);
    }
    fetchUnreadCount();
  };

  const handleMessageSent = (data: { chatId: string; message: Message }) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat._id !== data.chatId) return chat;
        // Remove matching optimistic temp message(s) for same sender and content
        const messagesWithoutTemp = chat.messages.filter(m =>
          !(m._id.startsWith('temp_') && m.content === data.message.content && m.sender._id === data.message.sender._id)
        );
        const exists = messagesWithoutTemp.some(m => m._id === data.message._id);
        const nextMessages = exists
          ? messagesWithoutTemp.map(m => (m._id === data.message._id ? data.message : m))
          : [...messagesWithoutTemp, data.message];
        return { ...chat, messages: nextMessages, lastMessage: data.message.timestamp };
      })
    );
    if (selectedChat?._id === data.chatId) {
      setMessages(prev => {
        const withoutTemp = prev.filter(m => !(m._id.startsWith('temp_') && m.content === data.message.content && m.sender._id === data.message.sender._id));
        const exists = withoutTemp.some(m => m._id === data.message._id);
        return exists ? withoutTemp.map(m => (m._id === data.message._id ? data.message : m)) : [...withoutTemp, data.message];
      });
    }
  };

  const handleMessagesRead = (data: { chatId: string; readBy: string; readAt: string }) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat._id === data.chatId
          ? {
              ...chat,
              messages: chat.messages.map(msg =>
                !msg.read && msg.sender._id !== data.readBy ? { ...msg, read: true, readAt: data.readAt } : msg
              ),
            }
          : chat
      )
    );
    if (selectedChat?._id === data.chatId) {
      setMessages(prev =>
        prev.map(msg => (!msg.read && msg.sender._id !== data.readBy ? { ...msg, read: true, readAt: data.readAt } : msg))
      );
    }
  };

  const handleUserStatusChange = (data: { userId: string; isOnline: boolean; lastSeenAt: string }) => {
    setChats(prevChats =>
      prevChats.map(chat => ({
        ...chat,
        participants: chat.participants.map(p =>
          p._id === data.userId ? { ...p, isOnline: data.isOnline, lastSeenAt: data.lastSeenAt } : p
        ),
      }))
    );
  };

  // Initialize WebSocket
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

    const socketInstance = io(WS_URL, {
      auth: { token },
      path: WS_PATH,
      transports: ['websocket', 'polling'],
      // withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('connect_error', () => {
      setIsConnected(false);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('new_message', (data: { chatId: string; message: Message }) => {
      handleNewMessage(data);
    });

    socketInstance.on('message_sent', (data: { chatId: string; message: Message }) => {
      handleMessageSent(data);
    });

    socketInstance.on('messages_read', (data: { chatId: string; readBy: string; readAt: string }) => {
      handleMessagesRead(data);
    });

    socketInstance.on('user_typing', (data: { chatId: string; userId: string; userName: string }) => {
      if (data.chatId === selectedChat?._id && data.userId !== getCurrentUserId()) {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.add(data.userId);
          return next;
        });
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

    socketInstance.on('user_status_change', (data: { userId: string; isOnline: boolean; lastSeenAt: string }) => {
      handleUserStatusChange(data);
    });

    socketInstance.on('error', (data: { message: string }) => {
      setError(data.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.removeAllListeners();
      socketInstance.close();
      setSocket(null);
      setIsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedChat?._id, WS_URL, WS_PATH]);

  // Load chats on mount or user change
  useEffect(() => {
    if (user) {
      fetchChats();
      fetchUnreadCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Poll only when NOT connected
  useEffect(() => {
    if (!user || !selectedChat || isConnected) return;
    const interval = setInterval(() => {
      fetchChats();
    }, 3000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedChat?._id, isConnected]);

  const memoizedFilteredChats = useMemo(
    () =>
      chats.filter(chat => {
        if (chat.isGroupChat) {
          return chat.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        }
        const otherParticipant = chat.participants.find(p => p._id !== getCurrentUserId());
        const displayName = otherParticipant?.name || 'Unknown User';
        return displayName.toLowerCase().includes(searchQuery.toLowerCase());
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chats, searchQuery, user?.id]
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedChat) {
      scrollToBottom();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?.messages]);

  const fetchChats = async () => {
    try {
      if (chats.length === 0) setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chat`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      
      if (data.success) {
        const newChats = data.data as Chat[];
        
        setChats(() => {
          const currentSelected = selectedChat;
          if (currentSelected) {
            const updatedSelected = newChats.find(c => c._id === currentSelected._id);
            if (updatedSelected) {
              setSelectedChat(updatedSelected);
              setMessages(updatedSelected.messages);
            }
          } else if (newChats.length > 0) {
            setSelectedChat(newChats[0]);
            setMessages(newChats[0].messages);
          }
          return newChats;
        });
      } else {
        setError(data.message);
      }
    } catch {
      if (chats.length === 0) setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chat/unread/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setUnreadCount(data.data as UnreadCount);
    } catch {
      // ignore
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/user/verified`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setAvailableUsers((data.data as User[]).filter(u => u._id !== getCurrentUserId()));
      }
    } catch {
      // ignore
    }
  };

  // Function to fetch profile data for participants
  const fetchParticipantProfiles = async (participantIds: string[]) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const uniqueIds = participantIds.filter(id => !participantProfiles[id]);
      
      if (uniqueIds.length === 0) return;

      const profiles: Record<string, { profileImage?: string }> = {};
      
      // Try to fetch profiles for each participant
      // Note: This assumes the backend has an endpoint to get profile by user ID
      // If not available, we'll need to modify the backend to support this
      for (const userId of uniqueIds) {
        try {
          // Try the user-specific profile endpoint first
          let response = await fetch(`${API_BASE_URL}/profile/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          // If that doesn't work, try a different approach
          if (!response.ok) {
            // Fallback: try to get user data with profile info
            response = await fetch(`${API_BASE_URL}/user/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              // Check if the response has profileImage directly or nested
              const profileImage = data.data.profileImage || data.data.profile?.profileImage;
              if (profileImage) {
                profiles[userId] = { profileImage };
              }
            }
          }
        } catch (error) {
          console.error(`Failed to fetch profile for user ${userId}:`, error);
        }
      }
      
      if (Object.keys(profiles).length > 0) {
        setParticipantProfiles(prev => ({ ...prev, ...profiles }));
      }
    } catch (error) {
      console.error('Failed to fetch participant profiles:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    const optimisticMessage: Message = {
      _id: `temp_${Date.now()}`,
      sender: {
        _id: getCurrentUserId(),
        name: user?.name || '',
        email: user?.email || '',
      },
      content: messageContent,
      messageType: 'text',
      read: false,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setChats(prev =>
      prev.map(chat =>
        chat._id === selectedChat._id
          ? { ...chat, messages: [...chat.messages, optimisticMessage], lastMessage: optimisticMessage.timestamp }
          : chat
      )
    );

    if (socket && isConnected) {
      try {
        socket.emit('send_message', {
          chatId: selectedChat._id,
          content: messageContent,
          messageType: 'text',
        });
      } catch {
        sendMessageViaAPI(messageContent);
      }
    } else {
      sendMessageViaAPI(messageContent);
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
        setMessages(prev =>
            prev.map(m => (m._id.startsWith('temp_') && m.content === messageContent ? realMessage : m))
        );
        setChats(prev =>
          prev.map(chat =>
            chat._id === selectedChat!._id
              ? {
                  ...chat,
                  messages: chat.messages.map(m => (m._id.startsWith('temp_') && m.content === messageContent ? realMessage : m)),
                  lastMessage: realMessage.timestamp,
                }
              : chat
          )
        );
      } else {
        setMessages(prev => prev.filter(m => !(m._id.startsWith('temp_') && m.content === messageContent)));
        setChats(prev =>
          prev.map(chat =>
            chat._id === selectedChat!._id
              ? { ...chat, messages: chat.messages.filter(m => !(m._id.startsWith('temp_') && m.content === messageContent)) }
              : chat
          )
        );
        setError(data.message);
      }
    } catch {
      setMessages(prev => prev.filter(m => !(m._id.startsWith('temp_') && m.content === messageContent)));
      setChats(prev =>
        prev.map(chat =>
          chat._id === selectedChat!._id
            ? { ...chat, messages: chat.messages.filter(m => !(m._id.startsWith('temp_') && m.content === messageContent)) }
            : chat
        )
      );
      setError('Failed to send message');
    }
  };

  const markMessagesAsRead = async (chatId: string) => {
    try {
      if (socket && isConnected) {
        socket.emit('mark_as_read', { chatId });
      } else {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        await fetch(`${API_BASE_URL}/chat/${chatId}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // ignore
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setMessages(chat.messages);
    setTypingUsers(new Set());
    markMessagesAsRead(chat._id);
  };

  const createNewChat = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      let response: Response;
      if (newChatType === 'direct') {
        response = await fetch(`${API_BASE_URL}/chat/direct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ participantId: selectedUsers[0] }),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/chat/group`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: groupName, participants: selectedUsers }),
        });
      }
      const data = await response.json();
      if (data.success) {
        setChats(prev => [data.data, ...prev]);
        setSelectedChat(data.data);
        setMessages(data.data.messages);
        setShowNewChatDialog(false);
        setSelectedUsers([]);
        setGroupName('');
      } else {
        setError(data.message);
      }
    } catch {
      setError('Failed to create chat');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
    if (chat.isGroupChat) return <Avatar><GroupIcon /></Avatar>;
    const other = chat.participants.find(p => p._id !== getCurrentUserId());
    
    // Get profile image directly from the participant data (now provided by backend)
    const profileImage = other?.profileImage;
  
    
    return profileImage ? <Avatar src={profileImage} /> : <Avatar>{other?.name?.charAt(0) || 'U'}</Avatar>;
  };

  const typingNames =
    selectedChat && typingUsers.size > 0
      ? Array.from(typingUsers)
          .map(id => selectedChat.participants.find(p => p._id === id)?.name || 'User')
          .join(', ')
      : '';

  if (error && !chats.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="90vh" flexDirection="column">
        <Typography variant="h6" color="error" gutterBottom>
          Error loading chats
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setError(null);
            fetchChats();
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (loading && !chats.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="90vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      key="chat-container"
      sx={{
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        '@keyframes typing': {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: 0.4 },
          '30%': { transform: 'translateY(-10px)', opacity: 1 },
        },
      }}
    >
      <Box sx={{ display: 'flex', height: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Chat List Sidebar */}
        <Box sx={{ 
          display: 'block', 
          width: { xs: '100%', md: '30%' }, 
          minWidth: { md: 300 },
          height: { xs: '100%', md: '100%' }
        }}>
          <Paper
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 0,
              borderRight: { md: `1px solid ${theme.palette.divider}` },
            }}
          >
            {/* Header */}
            <Box sx={{ p: { xs: 1.5, md: 2 }, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1.5, md: 2 } }}>
                <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                  Messages
                </Typography>
                <IconButton
                  color="primary"
                  onClick={() => {
                    setShowNewChatDialog(true);
                    fetchAvailableUsers();
                  }}
                  size="small"
                >
                  <Add />
                </IconButton>
              </Box>

              {/* Search */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{ 
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary', fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                    </InputAdornment>
                  ),
                  sx: { fontSize: { xs: '0.9rem', md: '1rem' } }
                }}
              />
            </Box>

            {/* Connection Status */}
            <Box sx={{ px: 2, py: 1, display: { xs: 'none', sm: 'block' } }}>
              <Chip size="small" label={isConnected ? 'Connected' : 'Disconnected'} color={isConnected ? 'success' : 'warning'} variant="outlined" />
            </Box>

            {/* Debug Panel - Remove this in production */}
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                  Debug: {Object.keys(participantProfiles).length} profiles cached
                </Typography>
              </Box>
            )}

            {/* Chat List */}
            <List sx={{ flex: 1, overflow: 'auto', p: { xs: 0.5, md: 0 } }}>
              {memoizedFilteredChats.map(chat => {
                const chatUnreadCount = unreadCount.unreadByChat[chat._id] || 0;
                const isSelected = selectedChat?._id === chat._id;
                const other = chat.participants.find(p => p._id !== getCurrentUserId());
                return (
                  <ListItem
                    key={chat._id}
                    sx={{
                      backgroundColor: isSelected ? theme.palette.primary.light + '20' : 'transparent',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: theme.palette.action.hover },
                      py: { xs: 1, md: 1.25 },
                      px: { xs: 1, md: 2 },
                      borderRadius: { xs: 1, md: 0 },
                      mx: { xs: 0.5, md: 0 },
                      mb: { xs: 0.5, md: 0 },
                    }}
                    onClick={() => {
                      if (isMobile) {
                        router.push(`/Admin-Dashboard/chat/${chat._id}`);
                      } else {
                        handleChatSelect(chat);
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          !chat.isGroupChat && other?.isOnline ? (
                            <Box
                              sx={{
                                width: { xs: 10, md: 12 },
                                height: { xs: 10, md: 12 },
                                borderRadius: '50%',
                                backgroundColor: theme.palette.success.main,
                                border: `2px solid ${theme.palette.background.paper}`,
                              }}
                            />
                          ) : null
                        }
                      >
                        {getChatAvatar(chat)}
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2" noWrap sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            {getChatDisplayName(chat)}
                          </Typography>
                          {chatUnreadCount > 0 && <Badge badgeContent={chatUnreadCount} color="primary" />}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                          {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : 'No messages yet'}
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Box>

        {/* Chat Area - Desktop Only */}
        <Box sx={{ 
          flex: 1, 
          display: { xs: 'none', md: 'flex' },
          width: { xs: '100%', md: 'auto' }
        }}>
          <Paper sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            borderRadius: 0, 
            flex: 1,
            width: '100%'
          }}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <Box sx={{ p: { xs: 1.5, md: 2 }, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 } }}>
                    <IconButton 
                      onClick={() => setSelectedChat(null)} 
                      sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                      size="small"
                    >
                      <ArrowBack />
                    </IconButton>
                    {getChatAvatar(selectedChat)}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>{getChatDisplayName(selectedChat)}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                        {selectedChat.isGroupChat
                          ? `${selectedChat.participants.length} members`
                          : selectedChat.participants.find(p => p._id !== getCurrentUserId())?.isOnline
                          ? 'Online'
                          : 'Offline'}
                      </Typography>
                    </Box>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Box>

                {/* Messages Area */}
                <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1.25, sm: 2 } }}>
                  {messages.map((message, index) => {
                    const isOwnMessage = message.sender?._id === getCurrentUserId();
                    const prev = messages[index - 1];
                    const isGrouped = shouldGroupMessage(message, prev);
                    const showSenderName = !isOwnMessage && !isGrouped;
                    return (
                      <Box
                        key={`${message._id}-${message.timestamp}-${index}`}
                        sx={{
                          display: 'flex',
                          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                          mb: isGrouped ? 0.5 : 2,
                          mt: isGrouped ? 0 : 1,
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: { xs: '85%', sm: '75%', md: '70%' },
                            backgroundColor: isOwnMessage ? theme.palette.primary.main : theme.palette.grey[100],
                            color: isOwnMessage ? theme.palette.primary.contrastText : theme.palette.text.primary,
                            borderRadius: isGrouped ? (isOwnMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px') : '18px',
                            p: 1.5,
                            position: 'relative',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          }}
                        >
                          {showSenderName && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block', fontWeight: 500 }}>
                              {message.sender?.name}
                            </Typography>
                          )}
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {message.content}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 0.5, gap: 0.5 }}>
                            <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                              {formatMessageTime(message.timestamp)}
                            </Typography>
                            {isOwnMessage && (
                              <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                                {message.read ? '✓✓' : '✓'}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}

                  {/* Typing Indicator */}
                  {typingUsers.size > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                      <Box
                        sx={{
                          backgroundColor: theme.palette.grey[100],
                          borderRadius: '18px 18px 18px 4px',
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: theme.palette.text.secondary,
                              animation: 'typing 1.4s infinite ease-in-out',
                              '&:nth-of-type(1)': { animationDelay: '0s' },
                              '&:nth-of-type(2)': { animationDelay: '0.2s' },
                              '&:nth-of-type(3)': { animationDelay: '0.4s' },
                            }}
                          />
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: theme.palette.text.secondary,
                              animation: 'typing 1.4s infinite ease-in-out',
                              '&:nth-of-type(1)': { animationDelay: '0s' },
                              '&:nth-of-type(2)': { animationDelay: '0.2s' },
                              '&:nth-of-type(3)': { animationDelay: '0.4s' },
                            }}
                          />
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: theme.palette.text.secondary,
                              animation: 'typing 1.4s infinite ease-in-out',
                              '&:nth-of-type(1)': { animationDelay: '0s' },
                              '&:nth-of-type(2)': { animationDelay: '0.2s' },
                              '&:nth-of-type(3)': { animationDelay: '0.4s' },
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          {typingNames} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <div ref={messagesEndRef} />
                </Box>

                {/* Message Input */}
                <Box sx={{ p: { xs: 1.25, md: 2 }, borderTop: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={e => handleInputChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: theme.palette.grey[50],
                          '&:hover': { backgroundColor: theme.palette.grey[100] },
                          '&.Mui-focused': { backgroundColor: theme.palette.background.paper },
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      sx={{
                        minWidth: 'auto',
                        px: { xs: 1.5, md: 2 },
                        py: { xs: 1.25, md: 1.5 },
                        borderRadius: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
                      }}
                    >
                      <Send />
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'text.secondary',
                }}
              >
                <ChatIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom>
                  Select a chat to start messaging
                </Typography>
                <Typography variant="body2">Choose from your existing conversations or start a new one</Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onClose={() => setShowNewChatDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">New Chat</Typography>
            <IconButton onClick={() => setShowNewChatDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Chat Type</InputLabel>
            <Select value={newChatType} onChange={e => setNewChatType(e.target.value as 'direct' | 'group')} label="Chat Type">
              <MenuItem value="direct">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon />
                  Direct Message
                </Box>
              </MenuItem>
              <MenuItem value="group">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon />
                  Group Chat
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {newChatType === 'group' && (
            <TextField fullWidth label="Group Name" value={groupName} onChange={e => setGroupName(e.target.value)} sx={{ mb: 2 }} />
          )}

          <FormControl fullWidth>
            <InputLabel>{newChatType === 'direct' ? 'Select User' : 'Select Users'}</InputLabel>
            <Select
              multiple={newChatType === 'group'}
              value={selectedUsers}
              onChange={e => setSelectedUsers(typeof e.target.value === 'string' ? [e.target.value] : (e.target.value as string[]))}
              label={newChatType === 'direct' ? 'Select User' : 'Select Users'}
            >
              {availableUsers.map(u => (
                <MenuItem key={u._id} value={u._id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={u.profileImage} sx={{ width: 24, height: 24 }}>
                      {u.name.charAt(0)}
                    </Avatar>
                    <Typography>{u.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewChatDialog(false)}>Cancel</Button>
          <Button
            onClick={createNewChat}
            variant="contained"
            disabled={selectedUsers.length === 0 || (newChatType === 'group' && !groupName.trim())}
          >
            Create Chat
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ChatPage;