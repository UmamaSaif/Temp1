import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
  Badge
} from '@mui/material';
import { Send as SendIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    role: string;
  };
  receiver: {
    _id: string;
    name: string;
    role: string;
  };
  content: string;
  read: boolean;
  createdAt: string;
}

interface ChatProps {
  doctorId: string; // Prop to specify which doctor to chat with
}

export default function Chat({ doctorId }: ChatProps) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Fetch chat history
  useEffect(() => {
    const fetchMessages = async () => {
      if (!doctorId || !user) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/messages/${doctorId}`);
        setMessages(response.data);
      } catch (error) {
        setError('Failed to load messages');
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch unread message count
    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get('/api/messages/unread/count');
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchMessages();
    fetchUnreadCount();
  }, [doctorId, user]);

  // Socket connection for real-time messaging
  useEffect(() => {
    if (!socket || !user || !doctorId) return;

    // Join a specific chat room
    const roomId = [user._id, doctorId].sort().join('-');
    socket.emit('join-chat', roomId);

    // Listen for new messages
    socket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Update unread count if the message is not from the current user
      if (message.sender._id !== user._id) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      socket.off('message');
    };
  }, [socket, user, doctorId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    const markMessagesAsRead = async () => {
      try {
        await axios.patch(`/api/messages/read/${doctorId}`);
        setUnreadCount(0);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    if (doctorId) {
      markMessagesAsRead();
    }
  }, [doctorId]);

  // Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !user) return;

    try {
      const roomId = [user._id, doctorId].sort().join('-');
      
      const messagePayload = {
        sender: user._id,
        receiver: doctorId,
        content: newMessage,
        roomId
      };

      // Emit message via socket
      socket.emit('chat-message', messagePayload);

      // Clear input
      setNewMessage('');
    } catch (error) {
      setError('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Chat with Doctor
        <Badge 
          badgeContent={unreadCount} 
          color="error" 
          sx={{ ml: 2 }}
        >
          <NotificationsIcon />
        </Badge>
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <List>
                {messages.map((message) => (
                  <ListItem
                    key={message._id}
                    sx={{
                      flexDirection: message.sender._id === user?._id ? 'row-reverse' : 'row',
                      gap: 1,
                      mb: 1
                    }}
                  >
                    <Avatar sx={{ bgcolor: message.sender.role === 'doctor' ? 'primary.main' : 'secondary.main' }}>
                      {message.sender.name[0]}
                    </Avatar>
                    <Paper
                      sx={{
                        p: 1,
                        maxWidth: '70%',
                        bgcolor: message.sender._id === user?._id ? 'primary.light' : 'grey.100'
                      }}
                    >
                      <ListItemText
                        primary={message.content}
                        secondary={new Date(message.createdAt).toLocaleString()}
                      />
                    </Paper>
                  </ListItem>
                ))}
                <div ref={messagesEndRef} />
              </List>
            </Box>

            <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Grid container spacing={1}>
                <Grid item xs>
                  <TextField
                    fullWidth
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item>
                  <Button
                    type="submit"
                    variant="contained"
                    endIcon={<SendIcon />}
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}