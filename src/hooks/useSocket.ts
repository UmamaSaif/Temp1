import { useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Message } from '../types/message';

interface UseSocketChatProps {
  roomId: string;
  onMessageReceived: (message: Message) => void;
}

export const useSocketChat = ({ roomId, onMessageReceived }: UseSocketChatProps) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit('join-chat', roomId);

    socket.on('message', onMessageReceived);

    return () => {
      socket.off('message');
    };
  }, [socket, roomId, onMessageReceived]);

  const sendMessage = useCallback((content: string) => {
    if (!socket || !roomId) return;

    socket.emit('chat-message', {
      roomId,
      content
    });
  }, [socket, roomId]);

  return { sendMessage };
};

interface UseSocketQueueProps {
  appointmentId: string;
  onQueueUpdate: (data: any) => void;
}

export const useSocketQueue = ({ appointmentId, onQueueUpdate }: UseSocketQueueProps) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !appointmentId) return;

    socket.emit('join-queue', appointmentId);

    socket.on('queue-update', onQueueUpdate);

    return () => {
      socket.off('queue-update');
    };
  }, [socket, appointmentId, onQueueUpdate]);
};