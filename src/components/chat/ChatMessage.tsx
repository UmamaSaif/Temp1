import React from 'react';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import { formatDateTime } from '../../utils/dateUtils';
import { Message } from '../../types/message';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export default function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
        mb: 2
      }}
    >
      {!isCurrentUser && (
        <Avatar
          sx={{
            bgcolor: message.sender.role === 'doctor' ? 'primary.main' : 'secondary.main',
            mr: 1
          }}
        >
          {message.sender.name[0]}
        </Avatar>
      )}
      <Box sx={{ maxWidth: '70%' }}>
        <Paper
          sx={{
            p: 2,
            bgcolor: isCurrentUser ? 'primary.light' : 'grey.100',
            borderRadius: 2
          }}
        >
          <Typography variant="body1">{message.content}</Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {formatDateTime(message.createdAt)}
          </Typography>
        </Paper>
      </Box>
      {isCurrentUser && (
        <Avatar
          sx={{
            bgcolor: 'secondary.main',
            ml: 1
          }}
        >
          {message.sender.name[0]}
        </Avatar>
      )}
    </Box>
  );
}